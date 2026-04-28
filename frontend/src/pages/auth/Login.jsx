import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.permissions?.revenue?.view) {
        navigate("/dashboard", { replace: true });
      } else if (user.permissions?.internSelf?.viewProfile) {
        navigate("/intern/dashboard", { replace: true });
      } else if (user.permissions?.mentorTools?.viewAssignedBatches) {
        navigate("/mentor/batches", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);

      // Smart Redirect based on permissions
      if (user.permissions?.revenue?.view) {
        navigate("/dashboard");
      } else if (user.permissions?.internSelf?.viewProfile) {
        navigate("/intern/dashboard");
      } else if (user.permissions?.mentorTools?.viewAssignedBatches) {
        navigate("/mentor/batches");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[var(--color-primary)]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-[var(--color-accent)]/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[var(--color-primary)]/20">
            <span className="text-white font-bold text-xl">OZ</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-display">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Sign in to Ofzen Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@ofzen.in"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full justify-center py-2.5 mt-2"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
