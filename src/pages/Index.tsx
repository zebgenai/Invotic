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
  Zap,
  Mail,
  Phone,
  Play,
  Star,
  Rocket,
  Instagram,
  Linkedin,
  Facebook
} from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Manage creators, assign roles, and track performance",
      color: "text-primary",
      bg: "bg-primary/10",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Youtube,
      title: "Channel Store",
      description: "Showcase and manage YouTube channels in one place",
      color: "text-destructive",
      bg: "bg-destructive/10",
      gradient: "from-destructive/20 to-destructive/5"
    },
    {
      icon: CheckSquare,
      title: "Task Tracking",
      description: "Assign tasks, set priorities, and monitor progress",
      color: "text-success",
      bg: "bg-success/10",
      gradient: "from-success/20 to-success/5"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Private messages, group chats, and broadcasts",
      color: "text-info",
      bg: "bg-info/10",
      gradient: "from-info/20 to-info/5"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track growth, engagement, and contribution metrics",
      color: "text-warning",
      bg: "bg-warning/10",
      gradient: "from-warning/20 to-warning/5"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Badges, leaderboards, and achievement tracking",
      color: "text-accent",
      bg: "bg-accent/10",
      gradient: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated 3D Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-1000">
        {/* Animated gradient orbs with 3D depth */}
        <div 
          className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/30 rounded-full blur-[80px] md:blur-[120px] animate-float-slow"
          style={{ transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-accent/25 rounded-full blur-[60px] md:blur-[100px] animate-float-medium"
          style={{ transform: `translate3d(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px, 0)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-info/20 rounded-full blur-[50px] md:blur-[80px] animate-float-fast"
          style={{ transform: `translate3d(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px, 0)` }}
        />
        
        {/* Floating 3D geometric shapes */}
        <div className="absolute top-20 right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-primary/20 rounded-xl animate-spin-slow transform rotate-45" />
        <div className="absolute bottom-32 left-[10%] w-12 h-12 md:w-20 md:h-20 border-2 border-accent/20 rounded-full animate-bounce-slow" />
        <div className="absolute top-1/3 right-[8%] w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg animate-float-medium transform -rotate-12" />
        <div className="absolute bottom-1/4 right-[20%] w-10 h-10 md:w-14 md:h-14 border border-info/30 rounded-full animate-pulse" />
        <div className="absolute top-[60%] left-[5%] w-6 h-6 md:w-12 md:h-12 bg-gradient-to-tr from-warning/20 to-transparent rounded-full animate-float-fast" />
        
        {/* Animated particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 md:w-2 md:h-2 bg-primary/40 rounded-full animate-particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
        
        {/* 3D Grid overlay with perspective */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px] transform-gpu" 
          style={{ transform: `perspective(1000px) rotateX(60deg) translateY(-50%)`, transformOrigin: 'center top' }}
        />
      </div>

      {/* Navigation with glassmorphism */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 md:px-12 md:py-4 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300 transform group-hover:scale-110">
            <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
          </div>
          <span className="font-display font-bold text-lg md:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Partnerunityx</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-sm hover:bg-primary/10 transition-all duration-300">
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/auth')} className="text-sm relative overflow-hidden group">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </nav>

      {/* Hero Section with 3D elements */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-16 md:px-6 md:pt-24 md:pb-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 border border-primary/30 mb-6 md:mb-8 animate-fade-in backdrop-blur-sm hover:scale-105 transition-transform cursor-default group">
            <div className="relative">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/50 blur-sm rounded-full animate-ping" />
            </div>
            <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">YouTube Automation Partnership</span>
            <Rocket className="w-3 h-3 md:w-4 md:h-4 text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>

          {/* 3D Heading with depth effect */}
          <div className="relative mb-4 md:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-display font-bold animate-fade-in leading-tight relative z-10">
              <span className="inline-block hover:scale-105 transition-transform duration-300">Want to Earn via</span>
              <br />
              <span className="relative inline-block">
                <span className="gradient-text animate-gradient-x bg-[length:200%_auto]">YouTube Automation?</span>
                {/* 3D shadow effect */}
                <span className="absolute -bottom-1 left-1 text-primary/10 -z-10 blur-[2px]">YouTube Automation?</span>
              </span>
            </h1>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-foreground mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center gap-2">
              Let's Do It Together
              <Star className="w-5 h-5 md:w-6 md:h-6 text-warning animate-spin-slow" />
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-in px-2" style={{ animationDelay: '0.15s' }}>
            I'm <span className="text-primary font-semibold relative">
              Sheraz Khan
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent" />
            </span>, and I'm looking for partners. Use my 6 years of experience to skip the struggle and start your YouTube journey for free.
          </p>

          {/* Glassmorphism Message Card with 3D hover */}
          <div 
            className="glass-card p-4 md:p-6 max-w-2xl mx-auto mb-8 md:mb-10 animate-fade-in group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 transform hover:-translate-y-1"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-base md:text-xl text-foreground font-medium relative z-10">
              <span className="text-success font-bold">No fees.</span>{" "}
              <span className="text-info font-bold">No fluff.</span>{" "}
              Just <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">100% actionable YouTube Automation</span> and a partnership built for growth.
            </p>
          </div>

          {/* 3D CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-20 animate-fade-in px-4" style={{ animationDelay: '0.25s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')} 
              className="text-base md:text-lg px-6 md:px-8 h-12 md:h-14 w-full sm:w-auto relative overflow-hidden group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join as Partner
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/auth')} 
              className="h-12 md:h-14 w-full sm:w-auto group border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* 3D Stats Cards */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
            {[
              { value: "6+", label: "Years Experience", delay: 0 },
              { value: "100%", label: "Free to Start", delay: 0.1 },
              { value: "0", label: "Hidden Fees", delay: 0.2 }
            ].map((stat, i) => (
              <div 
                key={stat.label}
                className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10 group"
                style={{ animationDelay: `${0.3 + stat.delay}s` }}
              >
                <p className="text-2xl md:text-5xl font-bold gradient-text mb-1 group-hover:scale-110 transition-transform inline-block">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section with 3D Card */}
      <section className="relative z-10 px-4 md:px-6 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative group perspective-1000">
            <div className="glass-card p-6 md:p-12 relative overflow-hidden animate-fade-in transition-all duration-500 transform-gpu group-hover:shadow-2xl group-hover:shadow-primary/20"
              style={{ 
                transform: `rotateY(${mousePosition.x * 0.02}deg) rotateX(${mousePosition.y * -0.02}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-gradient-shift" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float-slow" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float-medium" />
              
              <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                {/* 3D Avatar with rotating border */}
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-spin-slow blur-md opacity-60" style={{ padding: '4px' }} />
                  <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-primary to-accent p-1 transform group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={sherazPhoto} 
                      alt="Sheraz Khan" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-warning to-warning/80 rounded-full p-2 md:p-3 shadow-lg animate-bounce-slow">
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-warning-foreground" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h3 className="text-xl md:text-3xl font-display font-bold">Sheraz Khan</h3>
                    <div className="px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
                      <span className="text-xs font-medium text-primary">Founder</span>
                    </div>
                  </div>
                  <p className="text-primary font-medium mb-3 md:mb-4 flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-4 h-4" />
                    YouTube Automation Expert
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                    I started in <span className="text-foreground font-semibold bg-primary/10 px-1 rounded">2020</span>. After <span className="text-foreground font-semibold bg-accent/10 px-1 rounded">6 years</span> of trial and error, I created this portal to help others earn without making the same mistakes I did.
                  </p>
                  <div className="flex items-center gap-4 mt-4 md:mt-6 justify-center md:justify-start flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
                      <Youtube className="w-4 h-4 text-destructive" />
                      <span>YouTube Expert</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
                      <Trophy className="w-4 h-4 text-warning" />
                      <span>Since 2020</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with 3D Cards */}
      <section className="relative z-10 px-4 md:px-6 pb-16 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Powerful Features</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-display font-bold mb-3 md:mb-4">
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
                className="group relative animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative glass-card p-5 md:p-6 h-full transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl border border-border/50 group-hover:border-primary/30">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-3 md:mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon className={`w-6 h-6 md:w-7 md:h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className={`w-5 h-5 ${feature.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with 3D effects */}
      <section className="relative z-10 px-4 md:px-6 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
            <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
              {/* Animated background elements */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float-medium" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6 animate-bounce-slow">
                  <Rocket className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Start Your Journey Today</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-display font-bold mb-3 md:mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
                  Join thousands of creator teams already using Partnerunityx to manage their communities.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="text-base md:text-lg px-8 md:px-10 h-12 md:h-16 relative overflow-hidden group/btn shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 md:px-6 py-8 md:py-12 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8 mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 group-hover:shadow-lg group-hover:shadow-primary/25 transition-all transform group-hover:scale-110">
                <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
              </div>
              <span className="font-display font-bold text-sm md:text-base">Partnerunityx</span>
            </div>
            
            {/* Contact Support */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <a href="mailto:help@partnerunityx.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                </div>
                <span className="text-xs md:text-sm">help@partnerunityx.com</span>
              </a>
              <a href="tel:+923189177512" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                </div>
                <span className="text-xs md:text-sm">+92 318 9177512</span>
              </a>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <a 
              href="https://discord.gg/S7safxRM" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40 hover:scale-110 transition-all duration-300 group"
              title="Discord"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/sherazkhanofficial8?igsh=a2x6dDVvaHZzcm0%3D&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 rounded-full bg-[#E4405F]/10 border border-[#E4405F]/20 hover:bg-[#E4405F]/20 hover:border-[#E4405F]/40 hover:scale-110 transition-all duration-300 group"
              title="Instagram"
            >
              <Instagram className="w-4 h-4 md:w-5 md:h-5 text-[#E4405F]" />
            </a>
            <a 
              href="https://x.com/sherazkhanoffic?s=21" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 rounded-full bg-foreground/10 border border-foreground/20 hover:bg-foreground/20 hover:border-foreground/40 hover:scale-110 transition-all duration-300 group"
              title="X (Twitter)"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/sheraz-khan-14b767217?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40 hover:scale-110 transition-all duration-300 group"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-[#0A66C2]" />
            </a>
            <a 
              href="https://www.tiktok.com/@sherazkhaninvotic?_r=1&_t=ZS-93VOsbTflrR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 rounded-full bg-foreground/10 border border-foreground/20 hover:bg-foreground/20 hover:border-foreground/40 hover:scale-110 transition-all duration-300 group"
              title="TikTok"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/share/1AhidFUNTu/?mibextid=wwXIfr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 hover:scale-110 transition-all duration-300 group"
              title="Facebook"
            >
              <Facebook className="w-4 h-4 md:w-5 md:h-5 text-[#1877F2]" />
            </a>
          </div>
          
          <div className="border-t border-border/50 pt-4 md:pt-6 text-center">
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
