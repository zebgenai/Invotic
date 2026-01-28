import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import sherazPhoto from "@/assets/sheraz-khan.jpeg";
import atifPhoto from "@/assets/atif-zeb.jpeg";
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
  Zap,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Code,
  ShieldCheck
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
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-accent/15 rounded-full blur-[60px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-info/10 rounded-full blur-[50px] md:blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 md:px-12 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg md:text-xl">Partnerunityx</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-sm">
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/auth')} className="text-sm">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-16 md:px-6 md:pt-32 md:pb-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 md:mb-8 animate-fade-in">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary">YouTube Automation Partnership</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-display font-bold mb-4 md:mb-6 animate-fade-in leading-tight">
            Want to Earn via
            <br />
            <span className="gradient-text">YouTube Automation?</span>
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-foreground mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Let's Do It Together.
          </h2>

          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-in px-2" style={{ animationDelay: '0.15s' }}>
            I'm <span className="text-primary font-semibold">Sheraz Khan</span>, and I'm looking for partners. Use my 6 years of experience to skip the struggle and start your YouTube journey for free.
          </p>

          {/* The Message */}
          <div className="glass-card p-4 md:p-6 max-w-2xl mx-auto mb-8 md:mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-base md:text-xl text-foreground font-medium">
              <span className="text-success">No fees.</span> <span className="text-info">No fluff.</span> Just <span className="text-primary">100% actionable YouTube Automation</span> and a partnership built for growth.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-20 animate-fade-in px-4" style={{ animationDelay: '0.25s' }}>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-base md:text-lg px-6 md:px-8 h-12 md:h-14 w-full sm:w-auto">
              Join as Partner
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="h-12 md:h-14 w-full sm:w-auto">
              <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <p className="text-2xl md:text-4xl font-bold gradient-text">6+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Years Experience</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-4xl font-bold gradient-text">100%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Free to Start</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-4xl font-bold gradient-text">0</p>
              <p className="text-xs md:text-sm text-muted-foreground">Hidden Fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Portfolio Section */}
      <section className="relative z-10 px-4 md:px-6 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 md:p-12 relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <img 
                    src={sherazPhoto} 
                    alt="Sheraz Khan" 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-3xl font-display font-bold mb-2">Sheraz Khan</h3>
                <p className="text-primary font-medium mb-3 md:mb-4">Founder & YouTube Automation Expert</p>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  I started in <span className="text-foreground font-semibold">2020</span>. After <span className="text-foreground font-semibold">6 years</span> of trial and error, I created this portal to help others earn without making the same mistakes I did.
                </p>
                <div className="flex items-center gap-4 mt-4 md:mt-6 justify-center md:justify-start flex-wrap">
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

      {/* Developer Card Section */}
      <section className="relative z-10 px-4 md:px-6 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 md:p-12 relative overflow-hidden animate-fade-in group">
            {/* Animated glow effects */}
            <div className="absolute -top-20 -right-20 w-32 md:w-40 h-32 md:h-40 bg-info/30 rounded-full blur-[60px] md:blur-[80px] group-hover:bg-info/50 transition-all duration-700" />
            <div className="absolute -bottom-20 -left-20 w-32 md:w-40 h-32 md:h-40 bg-primary/30 rounded-full blur-[60px] md:blur-[80px] group-hover:bg-primary/50 transition-all duration-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 md:w-60 h-40 md:h-60 bg-accent/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse" />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-info/5 via-transparent to-primary/5" />
            
            <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
              {/* Avatar with animated border */}
              <div className="flex-shrink-0 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-info via-primary to-accent animate-[spin_4s_linear_infinite] blur-sm opacity-60" />
                <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-info to-primary p-1">
                  <img 
                    src={atifPhoto} 
                    alt="Atif Zeb" 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-2 -right-2 bg-info/20 backdrop-blur-sm border border-info/30 rounded-full p-1.5 md:p-2 animate-bounce">
                  <Code className="w-4 h-4 md:w-5 md:h-5 text-info" />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-start mb-2 flex-wrap">
                  <h3 className="text-xl md:text-3xl font-display font-bold">Atif Zeb</h3>
                  <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-info/20 border border-info/30 text-info text-xs md:text-sm font-medium">Developer</span>
                  <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-info" />
                </div>
                <p className="text-info font-medium mb-3 md:mb-4 text-sm md:text-base">Cybersecurity Analyst & Full-Stack Developer</p>
                <p className="text-muted-foreground text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
                  Building <span className="text-foreground font-semibold">secure, scalable web applications</span>, managing networks, and developing <span className="text-foreground font-semibold">AI-driven solutions</span> with a focus on modern security practices.
                </p>
                
                {/* Contact info with hover effects */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 md:gap-4 justify-center md:justify-start">
                  <a 
                    href="mailto:atifcyber7@gmail.com" 
                    className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-info transition-all duration-300 hover:scale-105"
                  >
                    <Mail className="w-3 h-3 md:w-4 md:h-4" />
                    <span>atifcyber7@gmail.com</span>
                  </a>
                  <a 
                    href="tel:+923099194338" 
                    className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-info transition-all duration-300 hover:scale-105"
                  >
                    <Phone className="w-3 h-3 md:w-4 md:h-4" />
                    <span>+92 309 9194338</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Peshawar, Pakistan</span>
                  </div>
                  <a 
                    href="https://linkedin.com/in/atif-zeb-76b866290" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-info transition-all duration-300 hover:scale-105"
                  >
                    <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 md:px-6 pb-16 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-display font-bold mb-3 md:mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
              Powerful features designed to help you manage, grow, and scale your creator community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card-hover p-5 md:p-6 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-3 md:mb-4`}>
                  <feature.icon className={`w-5 h-5 md:w-6 md:h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 md:px-6 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-3 md:mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
                Join thousands of creator teams already using Partnerunityx to manage their communities.
              </p>
              <Button size="lg" onClick={() => navigate('/auth')} className="text-base md:text-lg px-6 md:px-8 h-12 md:h-14">
                Create Free Account
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8 mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-sm md:text-base">Partnerunityx</span>
            </div>
            
            {/* Contact Support */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <a href="mailto:help@partnerunityx.com" className="text-xs md:text-sm">
                  help@partnerunityx.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <a href="tel:+923189177512" className="text-xs md:text-sm">
                  +92 318 9177512
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 md:pt-6 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              © 2026 Partnerunityx. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
