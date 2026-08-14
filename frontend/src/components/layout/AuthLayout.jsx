const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-4">
    <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
    <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"></div>
    <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 text-4xl shadow-xl">
            💳
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">{title}</h1>
          <p className="mt-2 text-gray-300">{subtitle}</p>
        </div>
        <div className="glass-card rounded-3xl border border-white/20 p-8 shadow-2xl backdrop-blur-2xl hover:scale-[1.02] transition-all duration-300">{children}
        </div>
        </div>
      </div>
  );
};

export default AuthLayout;
