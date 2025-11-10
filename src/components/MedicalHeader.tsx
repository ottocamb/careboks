import { Languages, LogOut, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import careboksLogo from "@/assets/careboks-logo.png";

interface MedicalHeaderProps {
  currentStep: number;
  totalSteps: number;
  onLogout: () => void;
  onLogoClick?: () => void;
}
const MedicalHeader = ({
  currentStep,
  totalSteps,
  onLogout,
  onLogoClick
}: MedicalHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';
  
  return <header className="bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={careboksLogo} 
              alt="Careboks" 
              className="h-10 w-auto cursor-pointer" 
              onClick={onLogoClick}
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && totalSteps > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    Step {currentStep} of {totalSteps}
                  </div>
                  <div className="w-32 h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{
                    width: `${currentStep / totalSteps * 100}%`
                  }} />
                  </div>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(isAccountPage ? '/app' : '/account')}
                className="text-muted-foreground hover:text-foreground"
              >
                {isAccountPage ? <Home className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>;
};
export default MedicalHeader;