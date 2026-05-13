export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/80 px-4 py-6 text-center text-sm text-slate-500 backdrop-blur">
      <p>&copy; {currentYear} Soccer Planner. All rights reserved.</p>
    </footer>
  );
}
