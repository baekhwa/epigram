export default function Button({ children, type = "submit", ...props }) {
  return (
    <button
      type={type}
      className="w-full p-4 bg-[oklch(49.6%_0.265_301.924)] text-white rounded-xl text-xl"
      {...props}
    >
      {children}
    </button>
  );
}
