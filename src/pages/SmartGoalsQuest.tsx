import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function SmartGoalsQuest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-light/30 to-teal-light/20 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Icon name="GraduationCap" size={16} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">УрокАИ</span>
          </button>
          <button
            onClick={() => navigate("/quests")}
            className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            К тренажёрам
          </button>
        </div>
      </div>

      <div className="flex-1 pt-16">
        <iframe
          src="/smart-goals.html"
          className="w-full border-0"
          style={{ height: "calc(100vh - 64px)" }}
          title="SMART-цели: интерактивный курс"
        />
      </div>
    </div>
  );
}
