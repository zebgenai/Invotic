import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import sherazPhoto from "@/assets/sheraz-khan.jpeg";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Youtube, 
  CheckSquare, 
  MessageCircle,
  BarChart3,
  Trophy,
  Shield,
  Zap
} from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Manage creators, assign roles, and track performance",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: Youtube,
      title: "Channel Store",
      description: "Showcase and manage YouTube channels in one place",
      color: "text-destructive",
      bg: "bg-destructive/10"
    },
    {
      icon: CheckSquare,
      title: "Task Tracking",
      description: "Assign tasks, set priorities, and monitor progress",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Private messages, group chats, and broadcasts",
      color: "text-info",
      bg: "bg-info/10"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track growth, engagement, and contribution metrics",
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Badges, leaderboards, and achievement tracking",
      color: "text-accent",
      bg: "bg-accent/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-info/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl">Partnerunityx</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 md:pt-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">YouTube Automation Partnership</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 animate-fade-in leading-tight">
            Want to Earn via
            <br />
            <span className="gradient-text">YouTube Automation?</span>
          </h1>

          <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Let's Do It Together.
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.15s' }}>
            I'm <span className="text-primary font-semibold">Sheraz Khan</span>, and I'm looking for partners. Use my 6 years of experience to skip the struggle and start your YouTube journey for free.
          </p>

          {/* The Message */}
          <div className="glass-card p-6 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-lg md:text-xl text-foreground font-medium">
              <span className="text-success">No fees.</span> <span className="text-info">No fluff.</span> Just <span className="text-primary">100% actionable YouTube Automation</span> and a partnership built for growth.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 h-14">
              Join as Partner
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="h-14">
              <Shield className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">6+</p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">100%</p>
              <p className="text-sm text-muted-foreground">Free to Start</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">0</p>
              <p className="text-sm text-muted-foreground">Hidden Fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Portfolio Section */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <img 
                    src={sherazPhoto} 
                    alt="Sheraz Khan" 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">Sheraz Khan</h3>
                <p className="text-primary font-medium mb-4">Founder & YouTube Automation Expert</p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  I started in <span className="text-foreground font-semibold">2020</span>. After <span className="text-foreground font-semibold">6 years</span> of trial and error, I created this portal to help others earn without making the same mistakes I did.
                </p>
                <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Youtube className="w-4 h-4 text-destructive" />
                    <span>YouTube Expert</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span>Since 2020</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to help you manage, grow, and scale your creator community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card-hover p-6 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of creator teams already using Partnerunityx to manage their communities.
              </p>
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 h-14">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold">Partnerunityx</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Partnerunityx. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
