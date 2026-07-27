import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  ArrowLeft, Camera, ShieldCheck, ShieldAlert, Check, 
  X, QrCode, Search, RefreshCw, Download, Users, CheckSquare, AlertCircle
} from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { Html5Qrcode } from "html5-qrcode";

const AttendanceDashboard = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scan"); // "scan" | "list" | "logs"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "present" | "pending"
  
  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [manualTicketId, setManualTicketId] = useState("");
  const [scanResult, setScanResult] = useState(null); // { type: "success" | "duplicate" | "error", message: "" }
  const [submittingScan, setSubmittingScan] = useState(false);
  
  const qrCodeRef = useRef(null);
  const resultTimeoutRef = useRef(null);

  const loadData = async () => {
    try {
      const [{ data: eventRes }, { data: statsRes }, { data: logsRes }] = await Promise.all([
        api.get(`/organizer/dashboard/event/${id}`),
        api.get(`/attendance/event/${id}`),
        api.get(`/attendance/logs/${id}`),
      ]);
      setEvent(eventRes.result.overview);
      setStats(statsRes.result);
      setLogs(logsRes.logs || []);
    } catch (error) {
      toast.error(apiMessage(error, "Could not load attendance details."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      stopScanner();
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, [id]);

  // QR Scanner logic
  const startScanner = async () => {
    setScanResult(null);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        toast.error("No cameras found.");
        return;
      }

      // Ensure container exists
      const container = document.getElementById("reader");
      if (!container) return;

      const qrCode = new Html5Qrcode("reader");
      qrCodeRef.current = qrCode;

      // Select back/environment camera if available, else use first camera
      const backCam = devices.find(d => 
        d.label.toLowerCase().includes("back") || 
        d.label.toLowerCase().includes("environment")
      );
      const cameraId = backCam ? backCam.id : devices[0].id;

      setScanning(true);
      await qrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleTicketCheckIn(decodedText);
        },
        () => {
          // Silent failure on scan frame-by-frame errors
        }
      );
    } catch (error) {
      console.error("Camera start failed", error);
      toast.error("Could not access camera. Please check permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop();
        qrCodeRef.current = null;
      } catch (error) {
        console.error("Camera stop failed", error);
      } finally {
        setScanning(false);
      }
    }
  };

  const handleTicketCheckIn = async (ticketId) => {
    const isEnded = event?.endDate ? new Date() > new Date(event.endDate) : false;
    if (isEnded) {
      toast.error("Cannot check in participants after the event has ended.");
      return;
    }

    const isNotStarted = event?.startDate ? new Date() < new Date(event.startDate) : false;
    if (isNotStarted) {
      toast.error("Cannot check in participants before the event has started.");
      return;
    }

    if (submittingScan) return;
    setSubmittingScan(true);
    
    // Auto stop camera on scan so it doesn't scan multiple times instantly
    await stopScanner();

    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);

    try {
      const { data } = await api.post("/attendance/scan", { ticketId });
      const participantName = data.registration.participant
        ? `${data.registration.participant.firstName} ${data.registration.participant.lastName}`
        : "Participant";
        
      setScanResult({
        type: "success",
        message: `Successfully Checked In: ${participantName} (Ticket ID: ${ticketId})`
      });
      toast.success("Attendance marked successfully!");
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || "Invalid ticket scan.";
      if (message.toLowerCase().includes("already checked in")) {
        setScanResult({
          type: "duplicate",
          message: "Duplicate Scan: This ticket has already been checked in!"
        });
        toast.error("Ticket already checked in.");
      } else {
        setScanResult({
          type: "error",
          message: `Check-in Failed: ${message} (Ticket ID: ${ticketId})`
        });
        toast.error("Check-in failed.");
      }
    } finally {
      setSubmittingScan(false);
      setManualTicketId("");
      // Reset the scan result banner after 6 seconds
      resultTimeoutRef.current = setTimeout(() => {
        setScanResult(null);
      }, 6000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim()) return;
    handleTicketCheckIn(manualTicketId.trim());
  };

  const handleManualCheckInOverride = async (regId, participantName) => {
    const isEnded = event?.endDate ? new Date() > new Date(event.endDate) : false;
    if (isEnded) {
      toast.error("Cannot check in participants after the event has ended.");
      return;
    }

    const isNotStarted = event?.startDate ? new Date() < new Date(event.startDate) : false;
    if (isNotStarted) {
      toast.error("Cannot check in participants before the event has started.");
      return;
    }

    const confirm = window.confirm(`Are you sure you want to manually override check-in for ${participantName}?`);
    if (!confirm) return;

    try {
      await api.put(`/attendance/manual/${regId}`);
      toast.success(`Check-in override successful for ${participantName}`);
      loadData();
    } catch (error) {
      toast.error(apiMessage(error, "Manual override failed."));
    }
  };

  const exportCsv = async () => {
    try {
      const response = await api.get(`/export/participants/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${event?.eventName || "event"}_attendance.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Could not export attendance reports.");
    }
  };

  // Filter participants
  const filteredParticipants = stats?.registrations.filter((reg) => {
    const name = reg.participant
      ? `${reg.participant.firstName} ${reg.participant.lastName} ${reg.participant.email}`.toLowerCase()
      : "";
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    
    if (statusFilter === "present") return matchesSearch && reg.checkedIn;
    if (statusFilter === "pending") return matchesSearch && !reg.checkedIn;
    return matchesSearch;
  }) || [];

  if (loading) return <Loader label="Loading Attendance Checking Dashboard..." />;

  const isEventEnded = event?.endDate ? new Date() > new Date(event.endDate) : false;
  const isEventNotStarted = event?.startDate ? new Date() < new Date(event.startDate) : false;

  const percent = stats?.totalRegistrations 
    ? Math.round((stats.present / stats.totalRegistrations) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/organizer/events/${id}`} className="text-[var(--color-muted)] hover:text-[var(--color-primary-dark)]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
              Attendance & Scanner Dashboard
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Event: {event?.eventName}
            </p>
          </div>
        </div>
      </div>

      {/* Event Ended Banner */}
      {isEventEnded && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-3 text-sm animate-pulse">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Event Attendance Locked</p>
            <p className="text-xs text-red-600 mt-0.5">
              This event has ended. Scanning tickets and manual overrides are disabled.
            </p>
          </div>
        </div>
      )}

      {/* Event Not Started Banner */}
      {isEventNotStarted && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 flex items-start gap-3 text-sm animate-pulse">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Event Attendance Not Open</p>
            <p className="text-xs text-blue-600 mt-0.5">
              This event has not started yet. Ticket scanning and manual check-ins will be allowed starting from {formatDate(event.startDate, "d MMM yyyy, h:mm a")}.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats?.totalRegistrations}</p>
              <p className="text-xs text-[var(--color-muted)]">Total Registrations</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-20" />
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.present}</p>
              <p className="text-xs text-[var(--color-muted)]">Scanned / Checked In</p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-500 opacity-20" />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats?.absent}</p>
              <p className="text-xs text-[var(--color-muted)]">Absent / Pending</p>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-500 opacity-20" />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1">
              <span>Attendance Rate</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => { stopScanner(); setActiveTab("scan"); }}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === "scan"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-gray-700"
          }`}
        >
          QR Ticket Scanner
        </button>
        <button
          onClick={() => { stopScanner(); setActiveTab("list"); }}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === "list"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-gray-700"
          }`}
        >
          Attendee List
        </button>
        <button
          onClick={() => { stopScanner(); setActiveTab("logs"); }}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
            activeTab === "logs"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-gray-700"
          }`}
        >
          Manual Override logs
        </button>
        <div className="flex-1 flex justify-end items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "scan" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Scanner view */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-sm font-semibold">Live Camera Scanner</h2>
              {scanning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="relative aspect-video max-w-sm mx-auto overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-50 flex items-center justify-center">
                <div id="reader" className="w-full h-full absolute top-0 left-0" />
                
                {!scanning && (
                  <div className="text-center z-10 p-6 space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Camera className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium">Camera is offline</p>
                    <Button onClick={startScanner} disabled={isEventEnded || isEventNotStarted}>
                      Start Camera Scanner
                    </Button>
                  </div>
                )}
              </div>

              {scanning && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={stopScanner}>
                    Turn Camera Off
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Scan details & manual checkin */}
          <div className="space-y-6">
            {/* Scan Results Display */}
            {scanResult && (
              <Card className={`border-l-4 ${
                scanResult.type === "success" 
                  ? "border-green-500 bg-green-50/50" 
                  : scanResult.type === "duplicate" 
                  ? "border-amber-500 bg-amber-50/50" 
                  : "border-red-500 bg-red-50/50"
              }`}>
                <CardBody className="flex items-start gap-3">
                  {scanResult.type === "success" && <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />}
                  {scanResult.type === "duplicate" && <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}
                  {scanResult.type === "error" && <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
                  
                  <div className="text-sm">
                    <p className={`font-semibold ${
                      scanResult.type === "success" 
                        ? "text-green-800" 
                        : scanResult.type === "duplicate" 
                        ? "text-amber-800" 
                        : "text-red-800"
                    }`}>
                      {scanResult.type === "success" && "Ticket Approved"}
                      {scanResult.type === "duplicate" && "Already Swiped"}
                      {scanResult.type === "error" && "Invalid Pass"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{scanResult.message}</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Manual entry card */}
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold">Ticket ID Manual Entry</h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder={isEventEnded ? "Event has ended" : isEventNotStarted ? "Event has not started" : "Paste/Type Ticket UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)"}
                      value={manualTicketId}
                      onChange={(e) => setManualTicketId(e.target.value)}
                      disabled={submittingScan || isEventEnded || isEventNotStarted}
                    />
                  </div>
                  <Button type="submit" loading={submittingScan} disabled={isEventEnded || isEventNotStarted} className="w-full">
                    <QrCode className="h-4 w-4" /> Check In Participant
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <Card>
          <CardBody className="space-y-4">
            {/* Filter tool */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-muted)] uppercase">Status:</span>
                <div className="inline-flex rounded-lg border border-[var(--color-border)] p-0.5 bg-gray-50 text-xs">
                  <button 
                    onClick={() => setStatusFilter("all")} 
                    className={`px-3 py-1 rounded-md transition ${statusFilter === "all" ? "bg-white shadow text-black font-medium" : "text-[var(--color-muted)]"}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setStatusFilter("present")} 
                    className={`px-3 py-1 rounded-md transition ${statusFilter === "present" ? "bg-white shadow text-green-700 font-medium" : "text-[var(--color-muted)]"}`}
                  >
                    Checked In
                  </button>
                  <button 
                    onClick={() => setStatusFilter("pending")} 
                    className={`px-3 py-1 rounded-md transition ${statusFilter === "pending" ? "bg-white shadow text-amber-700 font-medium" : "text-[var(--color-muted)]"}`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)] pointer-events-none" />
                  <Input
                    className="pl-9 h-9 w-60"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>

            {/* List Table */}
            {filteredParticipants.length === 0 ? (
              <p className="py-16 text-center text-sm text-[var(--color-muted)]">
                No participants match the selected filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-[var(--color-muted)] border-b border-[var(--color-border)]">
                      <th className="pb-3">Attendee</th>
                      <th className="pb-3">Ticket ID</th>
                      <th className="pb-3">Checked In Status</th>
                      <th className="pb-3">Registered At</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((reg) => (
                      <tr key={reg._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3">
                          <p className="font-semibold">
                            {reg.participant?.firstName} {reg.participant?.lastName}
                          </p>
                          <p className="text-xs text-[var(--color-muted)]">{reg.participant?.email}</p>
                        </td>
                        <td className="py-3 font-mono text-xs">{reg.ticketId}</td>
                        <td className="py-3">
                          {reg.checkedIn ? (
                            <Badge className="bg-green-50 text-green-700 border border-green-200">
                              Checked In
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Check-in
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-xs text-[var(--color-muted)]">
                          {formatDate(reg.createdAt, "d MMM yyyy, h:mm a")}
                        </td>
                        <td className="py-3 text-right">
                          {!reg.checkedIn ? (
                            <Button 
                              size="sm" 
                              disabled={isEventEnded || isEventNotStarted}
                              onClick={() => handleManualCheckInOverride(reg._id, `${reg.participant?.firstName} ${reg.participant?.lastName}`)}
                            >
                              <Check className="h-3.5 w-3.5" /> Check-in Override
                            </Button>
                          ) : (
                            <span className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                              <Check className="h-4 w-4" /> Swiped
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === "logs" && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Manual override Audit Log History</h2>
          </CardHeader>
          <CardBody>
            {logs.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--color-muted)]">
                No manual check-in override logs recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log._id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">
                        {log.details}
                      </p>
                      <p className="text-[var(--color-muted)]">
                        Action performed by: {log.organizer?.firstName} {log.organizer?.lastName} ({log.organizer?.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {log.action}
                      </Badge>
                      <p className="text-[var(--color-muted)] mt-1">
                        {formatDate(log.createdAt, "d MMM yyyy, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AttendanceDashboard;
