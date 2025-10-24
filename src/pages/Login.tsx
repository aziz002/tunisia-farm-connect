import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sprout } from 'lucide-react';
import farmHero from '@/assets/farm-hero.jpg';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    governorate: '',
    farmType: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
    navigate('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      // For POC: treat signup as login
      await login(formData.email, formData.password);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={farmHero} 
          alt="Tunisian Farm" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-4xl font-bold mb-2">FarmHub</h2>
          <p className="text-xl">من الأرض إلى السوق، كل شيء في لوحة واحدة</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <Sprout className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">FarmHub</h1>
              <p className="text-xs text-muted-foreground">Your farming companion</p>
            </div>
          </div>

          {step === 'login' ? (
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your FarmHub account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="farmer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">Sign In</Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setStep('signup')}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Get started with FarmHub today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Ahmed Ben Ali"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="farmer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="governorate">Governorate</Label>
                    <Select value={formData.governorate} onValueChange={(val) => setFormData({...formData, governorate: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tunis">Tunis</SelectItem>
                        <SelectItem value="ariana">Ariana</SelectItem>
                        <SelectItem value="ben-arous">Ben Arous</SelectItem>
                        <SelectItem value="manouba">Manouba</SelectItem>
                        <SelectItem value="nabeul">Nabeul</SelectItem>
                        <SelectItem value="sousse">Sousse</SelectItem>
                        <SelectItem value="sfax">Sfax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select value={formData.farmType} onValueChange={(val) => setFormData({...formData, farmType: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="What do you farm?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crops">Crops Only</SelectItem>
                        <SelectItem value="livestock">Livestock Only</SelectItem>
                        <SelectItem value="mixed">Mixed (Crops + Livestock)</SelectItem>
                        <SelectItem value="olive">Olive Groves</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Account</Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setStep('login')}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
