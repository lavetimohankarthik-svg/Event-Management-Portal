import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, Paperclip, ArrowLeft, Circle } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatDate, initials } from "@/lib/utils";

// Tier B-3: Team Chat. Requires Tier A-1 (team must already be
// registered) — enforced server-side too via chatService.assertMembership.
const TeamChat = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttachment, setShowAttachment] = useState(false);
  const [online, setOnline] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const [{ data: teamsRes }, { data: msgRes }] = await Promise.all([
          api.get("/teams"),
          api.get(`/chat/${teamId}/messages`),
        ]);

        if (!mounted) return;

        const thisTeam = (teamsRes.teams || []).find((t) => t._id === teamId);
        setTeam(thisTeam || null);
        setMessages(msgRes.messages || []);
      } catch (error) {
        toast.error(apiMessage(error, "Couldn't open team chat."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const socket = getSocket();
    socket.emit("chat:join", teamId);

    const onMessage = (message) => {
      if (message.team === teamId || message.team?._id === teamId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onOnline = (payload) => {
      if (payload.teamId === teamId) setOnline(payload.online || []);
    };

    const onTyping = ({ userId, name }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: name }));
    };

    const onStopTyping = ({ userId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    const onError = (msg) => toast.error(msg);

    socket.on("chat:message", onMessage);
    socket.on("chat:online", onOnline);
    socket.on("chat:typing", onTyping);
    socket.on("chat:stopTyping", onStopTyping);
    socket.on("chat:error", onError);

    return () => {
      mounted = false;
      socket.off("chat:message", onMessage);
      socket.off("chat:online", onOnline);
      socket.off("chat:typing", onTyping);
      socket.off("chat:stopTyping", onStopTyping);
      socket.off("chat:error", onError);
    };
  }, [teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    const socket = getSocket();
    socket.emit("chat:typing", { teamId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("chat:stopTyping", { teamId });
    }, 1500);
  };

  const send = () => {
    if (!content.trim() && !attachmentUrl.trim()) return;

    const socket = getSocket();
    socket.emit("chat:send", {
      teamId,
      content: content.trim(),
      attachment: attachmentUrl.trim()
        ? { url: attachmentUrl.trim(), name: "Shared link" }
        : undefined,
    });

    setContent("");
    setAttachmentUrl("");
    setShowAttachment(false);
    getSocket().emit("chat:stopTyping", { teamId });
  };

  const typingLabel = useMemo(() => {
    const names = Object.values(typingUsers);
    if (!names.length) return null;
    return `${names.join(", ")} ${names.length > 1 ? "are" : "is"} typing...`;
  }, [typingUsers]);

  if (loading) return <Loader label="Loading team chat..." />;

  if (!team) {
    return (
      <p className="py-16 text-center text-sm text-[var(--color-muted)]">
        Team not found, or it isn't registered yet.
      </p>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <Link to="/participant/teams" className="text-[var(--color-muted)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{team.teamName}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">
            {team.event?.eventName} · {online.length} online
          </p>
        </div>
        <div className="flex -space-x-2">
          {team.members?.slice(0, 4).map((m) => (
            <span
              key={m._id}
              title={`${m.firstName} ${m.lastName}`}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-primary-dark)]"
            >
              {initials(m.firstName, m.lastName)}
              {online.includes(m._id) && (
                <Circle className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-green-500 text-green-500" />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-muted)]">
            No messages yet. Say hello to your team!
          </p>
        )}

        {messages.map((m) => {
          const mine = (m.sender?._id || m.sender) === user.id;
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-paper)] text-[var(--color-ink)]"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-xs font-semibold opacity-70">
                    {m.sender?.firstName}
                  </p>
                )}
                {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                {m.attachment?.url && (
                  <a
                    href={m.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-1 flex items-center gap-1 text-xs underline ${
                      mine ? "text-white/90" : "text-[var(--color-primary)]"
                    }`}
                  >
                    <Paperclip className="h-3 w-3" /> {m.attachment.name || "Link"}
                  </a>
                )}
                <p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-[var(--color-muted)]"}`}>
                  {formatDate(m.createdAt, "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--color-border)] px-5 py-3">
        {typingLabel && (
          <p className="mb-1.5 text-xs italic text-[var(--color-muted)]">{typingLabel}</p>
        )}
        {showAttachment && (
          <Input
            className="mb-2"
            placeholder="Paste a file/document link to share"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttachment((v) => !v)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper)]"
            title="Share a link"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <Input
            placeholder="Type a message..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
