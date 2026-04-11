interface Props {
  password: string;
}

function getStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!password) return { score: 0, label: "" };

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const complexityCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
  if (complexityCount >= 2) score++;
  if (complexityCount >= 4 && password.length >= 10) score = 3;

  // Cap at 3
  score = Math.min(score, 3) as 0 | 1 | 2 | 3;

  const labels: Record<0 | 1 | 2 | 3, string> = {
    0: "",
    1: "Faible",
    2: "Moyen",
    3: "Fort",
  };

  return { score: score as 0 | 1 | 2 | 3, label: labels[score as 0 | 1 | 2 | 3] };
}

const segmentColors: Record<number, { active: string; text: string }> = {
  1: { active: "bg-red-500", text: "text-red-500" },
  2: { active: "bg-amber-400", text: "text-amber-500" },
  3: { active: "bg-emerald-500", text: "text-emerald-500" },
};

export function PasswordStrengthMeter({ password }: Props) {
  const { score, label } = getStrength(password);

  if (!password) return null;

  const colors = segmentColors[score] || segmentColors[1];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors.active : "bg-muted"
            }`}
          />
        ))}
      </div>
      {label && (
        <p className={`text-[11px] font-semibold ${colors.text} transition-colors duration-200`}>
          Force du mot de passe : <span className="font-bold">{label}</span>
        </p>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
