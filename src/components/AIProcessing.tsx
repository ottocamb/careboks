import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, Languages, Check, Loader2 } from "lucide-react";

interface AIProcessingProps {
  onNext: (draft: string) => void;
  patientData: any;
  technicalNote: string;
}

const AIProcessing = ({ onNext, patientData, technicalNote }: AIProcessingProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { icon: BookOpen, label: "Analyzing clinical note", desc: "Extracting key medical information" },
    { icon: Brain, label: "Applying personalization", desc: "Adapting content to patient profile" },
    { icon: Languages, label: "Language optimization", desc: `Generating content in ${patientData.language}` },
    { icon: Check, label: "Safety validation", desc: "Ensuring clinical accuracy and safety" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(timer);
          return 100;
        }
        
        const newProgress = prev + 2;
        const newStep = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(Math.min(newStep, steps.length - 1));
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const generatePatientFriendlyDraft = () => {
    // Simulate AI processing based on the patient data and technical note
    const ageGroup = parseInt(patientData.age) > 65 ? "older adult" : "adult";
    const literacyLevel = patientData.healthLiteracy;
    
    let draft = "";
    
    if (patientData.language === "estonian") {
      draft = `Teie südameseisund ja ravi

Lugupeetud ${patientData.sex === 'male' ? 'härra' : 'proua'},

Teie südame uuringud näitavad, et Teil on südamepuudulikkus. See tähendab, et Teie süda ei suuda keha kõikidesse osadesse piisavalt verd pumbata.

${literacyLevel === 'low' ? 'Lihtsamalt öeldes:' : 'Põhjalikumalt selgitades:'}
• Teie süda töötab praegu 35% tugevusega (normaalne on 55-70%)
• Vereanalüüs näitas kõrget südamestressi taset
• Jalad on tursunud, sest vedelik koguneb kehas

Teie ravim:
• Furosemiid 40mg – aitab kehast liigset vedelikku välja juua
• Metoprolol 25mg – aitab südamel kergemini töötada  
• Lisinopril 10mg – hoiab vererõhku madalal

Mida Te peate tegema:
• Jooge mitte rohkem kui 2 liitrit vedelikku päevas
• Sööge vähe soola (alla 2 grammi päevas)
• Kaaluge end iga päev samal ajal
• Võtke ravimeid täpselt nii, nagu arst kirjutas

${patientData.mentalState === 'anxious' ? 'Me mõistame, et see diagnoos võib tunduda hirmutav. Teie arst ja õed on siin, et Teid aidata.' : ''}

Millal pöörduda kiirabi poole:
• Hingeõhutus muutub palju halvemaks
• Jalad tursuvad rohkem kui varem
• Kaal suureneb üle 2 kg kahe päeva jooksul

Järgmine visiit: 2 nädala pärast kardioloogi juures`;
    } else if (patientData.language === "russian") {
      draft = `Ваше состояние сердца и лечение

Уважаемый ${patientData.sex === 'male' ? 'господин' : 'госпожа'},

Обследования показали, что у Вас сердечная недостаточность. Это означает, что Ваше сердце не может перекачивать достаточно крови во все части тела.

${literacyLevel === 'low' ? 'Простыми словами:' : 'Подробнее:'}
• Ваше сердце сейчас работает на 35% мощности (норма 55-70%)
• Анализ крови показал высокий уровень стресса сердца
• Ноги отекают, потому что жидкость накапливается в организме

Ваши лекарства:
• Фуросемид 40мг – помогает вывести лишнюю жидкость из организма
• Метопролол 25мг – помогает сердцу работать легче
• Лизиноприл 10мг – поддерживает низкое кровяное давление

Что Вам нужно делать:
• Пейте не более 2 литров жидкости в день
• Ешьте мало соли (менее 2 граммов в день)
• Взвешивайтесь каждый день в одно время
• Принимайте лекарства точно как прописал врач

${patientData.mentalState === 'anxious' ? 'Мы понимаем, что этот диагноз может пугать. Ваш врач и медсестры здесь, чтобы помочь Вам.' : ''}

Когда обращаться в скорую помощь:
• Одышка становится намного хуже
• Ноги отекают больше обычного
• Вес увеличивается более чем на 2 кг за два дня

Следующий визит: через 2 недели к кардиологу`;
    } else {
      draft = `Your Heart Condition and Treatment

Dear ${patientData.sex === 'male' ? 'Mr.' : patientData.sex === 'female' ? 'Ms.' : ''} Patient,

Your heart tests show that you have heart failure. This means your heart cannot pump enough blood to all parts of your body.

${literacyLevel === 'low' ? 'In simple terms:' : 'More detailed explanation:'}
• Your heart is currently working at 35% strength (normal is 55-70%)
• Your blood test showed high levels of heart stress
• Your legs are swollen because fluid is building up in your body

Your medications:
• Furosemide 40mg – helps remove extra fluid from your body
• Metoprolol 25mg – helps your heart work more easily
• Lisinopril 10mg – keeps your blood pressure low

What you need to do:
• Drink no more than 2 liters of fluid per day
• Eat low salt (less than 2 grams daily)
• Weigh yourself every day at the same time
• Take your medications exactly as your doctor prescribed

${patientData.mentalState === 'anxious' ? 'We understand this diagnosis may feel frightening. Your doctor and nurses are here to help you.' : ''}

${patientData.includeRelatives ? '\nFor family members:\nPlease help the patient follow their fluid and salt restrictions. Watch for signs of worsening symptoms and encourage medication compliance.\n' : ''}

When to seek emergency care:
• Breathing becomes much worse
• Legs swell more than usual
• Weight increases by more than 2kg in two days

Next appointment: In 2 weeks with cardiologist

${patientData.hasAccessibilityNeeds ? '\n[Note: This document is available in large print format upon request]' : ''}`;
    }

    return draft;
  };

  const handleContinue = () => {
    const draft = generatePatientFriendlyDraft();
    onNext(draft);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Processing</CardTitle>
          </div>
          <CardDescription>
            Transforming technical note into patient-friendly communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep && !isComplete;
              const isCompleted = index < currentStep || isComplete;
              
              return (
                <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                  isActive ? 'bg-primary/5 border-primary/20' : 
                  isCompleted ? 'bg-success/5 border-success/20' : 
                  'bg-muted/30 border-muted'
                }`}>
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-primary text-primary-foreground' :
                    isCompleted ? 'bg-success text-success-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isActive && !isCompleted ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {isComplete && (
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-success">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Draft generated successfully</span>
                </div>
                <Button onClick={handleContinue} className="flex items-center space-x-2">
                  <span>Review Draft</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-medical-light-blue border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Processing Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Language:</span> {patientData.language}
            </div>
            <div>
              <span className="font-medium">Literacy Level:</span> {patientData.healthLiteracy}
            </div>
            <div>
              <span className="font-medium">Journey Type:</span> {patientData.journeyType}
            </div>
            <div>
              <span className="font-medium">Risk Preference:</span> {patientData.riskAppetite}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIProcessing;