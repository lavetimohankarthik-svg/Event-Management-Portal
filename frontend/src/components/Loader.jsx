import { ClipLoader } from "react-spinners";

const Loader = ({ full = false, label = "Loading..." }) => (
  <div
    className={
      full
        ? "flex h-screen w-full flex-col items-center justify-center gap-3 bg-[var(--color-paper)]"
        : "flex flex-col items-center justify-center gap-3 py-16"
    }
  >
    <ClipLoader color="#4c2a86" size={34} />
    <p className="text-sm text-[var(--color-muted)]">{label}</p>
  </div>
);

export default Loader;
