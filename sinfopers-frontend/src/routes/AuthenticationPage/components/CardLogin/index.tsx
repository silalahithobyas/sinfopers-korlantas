"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Shield, LogIn, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";

const CardLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAccount, loginResponse, loading } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Input tidak lengkap",
        description: "Silakan masukkan username dan password",
      });
      return;
    }

    await loginAccount({
      username: username,
      password: password,
    });
  };

  useEffect(() => {
    if (loginResponse) {
      if (loginResponse.success) {
        navigate("/", {
          state: { afterLogin: true },
        });
        return;
      }

      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description: "Username atau password tidak valid",
      });
    }
  }, [loginResponse, navigate]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
      <Card className="w-[400px] shadow-lg border-t-4 border-t-blue-800">
        <CardHeader className="flex flex-col items-center text-blue-800 pt-6 pb-3">
          <div className="bg-blue-800 p-3 rounded-full mb-3">
            <Shield className="h-8 w-8 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold">SINFOPERS POLANTAS</CardTitle>
          <p className="text-sm mt-1 text-blue-600">SISTEM INFORMASI PERSONEL</p>
        </CardHeader>

        <CardContent className="px-8">
          <div className="space-y-4" onKeyDown={handleKeyPress}>
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <User size={16} className="text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700">Username</label>
              </div>
              <Input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full h-10"
                  onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <Lock size={16} className="text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700">Password</label>
              </div>
              <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full h-10"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Lock size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col px-8 pb-6">
          {loading ? (
              <Button
                  disabled
                  className="w-full bg-blue-800 hover:bg-blue-800 text-white h-10"
              >
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Memproses...
              </Button>
          ) : (
              <Button
                  className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold h-10 flex items-center justify-center gap-2"
                  onClick={handleLogin}
              >
                <LogIn size={18} />
                Masuk
              </Button>
          )}

          <div className="mt-4 text-xs text-center text-gray-500">
            Masukkan kredensial Anda untuk mengakses sistem
          </div>
        </CardFooter>

        <Toaster />
      </Card>
  );
};

export default CardLogin;