import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft, PenLine, Video, Image, Mic, Search, Users, Check, AlertTriangle, Wrench } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useSignupEnabled } from '@/hooks/useAppSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Set to true to show maintenance banner
const MAINTENANCE_MODE = true;

const specialties = [
  { value: 'script_writer', label: 'Script Writer', icon: PenLine },
  { value: 'video_editor', label: 'Video Editor', icon: Video },
  { value: 'thumbnail_designer', label: 'Thumbnail Designer', icon: Image },
  { value: 'voice_over_artist', label: 'Voice Over Artist', icon: Mic },
  { value: 'seo_specialist', label: 'SEO Specialist', icon: Search },
  { value: 'channel_manager', label: 'Channel Manager', icon: Users },
] as const;

type SpecialtyValue = typeof specialties[number]['value'];

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .email('Invalid email address')
    .refine((email) => email.toLowerCase().endsWith('@gmail.com'), {
      message: 'Only Gmail addresses (@gmail.com) are allowed',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  specialties: z.array(z.string()).min(1, 'Please select at least 1 specialty').max(3, 'Maximum 3 specialties allowed'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialties: [] as SpecialtyValue[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signupEnabled, isLoading: settingsLoading } = useSignupEnabled();

  // Auto-redirect when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const toggleSpecialty = (value: SpecialtyValue) => {
    setFormData(prev => {
      const current = prev.specialties;
      if (current.includes(value)) {
        return { ...prev, specialties: current.filter(s => s !== value) };
      }
      if (current.length >= 3) {
        toast({
          title: 'Maximum reached',
          description: 'You can select up to 3 specialties.',
          variant: 'destructive',
        });
        return prev;
      }
      return { ...prev, specialties: [...current, value] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isSignUp) {
        // Check if signups are enabled
        if (!signupEnabled) {
          toast({
            title: 'Signups Disabled',
            description: 'New user registration is currently disabled. Please try again later.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        // Pass first specialty for backward compatibility, and all specialties
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.fullName, 
          formData.specialties[0],
          formData.specialties
        );
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to Partnerunityx. Your KYC is pending approval.',
          });
          navigate('/dashboard');
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Successfully signed in.',
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Maintenance Banner */}
      {MAINTENANCE_MODE && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-warning/90 via-warning to-warning/90 text-warning-foreground py-3 px-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-center">
            <Wrench className="w-5 h-5 animate-pulse flex-shrink-0" />
            <p className="text-sm md:text-base font-medium">
              <span className="font-bold">🚧 Scheduled Maintenance:</span> We're upgrading our servers for a better experience. We'll be back online shortly. Thank you for your patience!
            </p>
            <Wrench className="w-5 h-5 animate-pulse flex-shrink-0 hidden sm:block" />
          </div>
        </div>
      )}

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className={cn("relative z-10 w-full max-w-md px-4", MAINTENANCE_MODE && "pt-16")}>
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 hover:bg-primary/20 transition-colors">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold gradient-text hover:opacity-80 transition-opacity">
                Partnerunityx
              </h1>
            </Link>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Form */}
          {isSignUp && !signupEnabled && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                New user registration is currently disabled. Please try again later or contact the administrator.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-glow"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <Label>
                  What will you do?{' '}
                  <span className="text-muted-foreground text-xs font-normal">
                    (Select 1-3)
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {specialties.map((specialty) => {
                    const Icon = specialty.icon;
                    const isSelected = formData.specialties.includes(specialty.value);
                    return (
                      <button
                        key={specialty.value}
                        type="button"
                        onClick={() => toggleSpecialty(specialty.value)}
                        disabled={loading}
                        className={cn(
                          "relative flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{specialty.label}</span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {formData.specialties.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.specialties.length}/3
                  </p>
                )}
                {errors.specialties && (
                  <p className="text-sm text-destructive">{errors.specialties}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-glow"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-glow pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                  setFormData({ fullName: '', email: '', password: '', specialties: [] });
                }}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
