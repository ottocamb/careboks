import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, Languages, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCasePersistence } from "@/hooks/useCasePersistence";

interface AIProcessingProps {
  caseId: string;
  onNext: (draft: string, analysis?: any) => void;
  patientData: any;
  technicalNote: string;
}

const AIProcessing = ({ caseId, onNext, patientData, technicalNote }: AIProcessingProps) => {
  const { saveAIAnalysis, updateCase } = useCasePersistence();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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
    const literacyLevel = patientData.healthLiteracy;
    
    let draft = "";
    
    if (patientData.language === "estonian") {
      draft = `═══════════════════════════════════════════════════
MIS MUL ON
═══════════════════════════════════════════════════

Lugupeetud ${patientData.sex === 'male' ? 'härra' : 'proua'},

Teil on diagnoositud südamepuudulikkus. ${literacyLevel === 'low' ? 'Lihtsamalt öeldes: Teie süda ei suuda keha kõikidesse osadesse piisavalt verd pumbata.' : 'See tähendab, et Teie südame lihased on nõrgenenud ja ei suuda efektiivselt verd pumpata.'}

Teie testide tulemused:
• Südame tugevus: 35% (normaalne on 55-70%)
• Vereanalüüs näitas kõrget südamestressi taset  
• Jalad on tursunud, sest vedelik koguneb kehas

${patientData.mentalState === 'anxious' ? 'Me mõistame, et see diagnoos võib tunduda hirmutav. Teie arst ja õed on siin, et Teid aidata. See on ravi- ja hallatav seisund.' : ''}


═══════════════════════════════════════════════════
KUIDAS PEAKSIN EDASI ELAMA
═══════════════════════════════════════════════════

Teie igapäevane ravi ja elustiil:

Vedeliku tarbimine:
• Jooge mitte rohkem kui 2 liitrit vedelikku päevas
• See hõlmab vett, teed, suppi, kõike

Toitumine:
• Sööge vähe soola (alla 2 grammi päevas)
• Vältide konserveeritud toite ja kiirtoitu
• Kasutage värskeid maitsetaimi soola asemel

Igapäevane jälgimine:
• Kaaluge end iga päev samal ajal
• Kirjutage kaal üles
• Võtke ravimeid täpselt nii, nagu arst kirjutas

Füüsiline aktiivsus:
• Kerge jalutuskäik 10-15 minutit päevas
• Puhkake, kui tunnete väsimust
• Ärge tehke rasket füüsilist tööd


═══════════════════════════════════════════════════
KUIDAS JÄRGMISED 6 KUUD VÄLJA NÄEVAD
═══════════════════════════════════════════════════

Esimesed 2 nädalat:
• Te tunnete end väsinuna, kuna keha kohaneb ravimitega
• Jalad hakkavad vähem tursuma
• Hingamine muutub kergemaks

1-3 kuud:
• Energia tase hakkab paranema
• Saate rohkem teha ilma hingeldamata
• Südame tugevus võib tõusta 40-45%

3-6 kuud:
• Võite taas teha kerget aiatööd või jalutuskäike
• Jätkuvad regulaarsed kontrollid kardioloogi juures
• Ravimeid võib kohandada


═══════════════════════════════════════════════════
MIDA SEE TÄHENDAB MINU ELULE
═══════════════════════════════════════════════════

Pikaajalised muutused:

${literacyLevel === 'low' ? 'Te peate võtma ravimeid kogu elu ja jälgima oma südant. Kuid paljud inimesed elavad südamepuudulikkusega head elu.' : 'Südamepuudulikkus on krooniline seisund, mis nõuab pidevat ravi ja elustiili kohandamist. Õige raviga saate elada täisväärtuslikku elu.'}

Te saate:
• Jätkata tööd (kerget füüsilist tööd)
• Reisida (konsulteerige arstiga enne pikki reise)
• Olla perega koos ja nautida elu

Te peate:
• Võtma ravimeid iga päev
• Käima regulaarselt kontrollis
• Jälgima oma kehakaalu ja sümptomeid
• Vältima ülemäärast füüsilist koormust


═══════════════════════════════════════════════════
MINU RAVIMID
═══════════════════════════════════════════════════

1. Furosemiid 40mg (hommikul)
   Mida see teeb: Aitab kehast liigset vedelikku välja juua
   Kui ei võta: Jalad tursuvad, hingamine muutub raskemaks, vedelik koguneb kopsudesse

2. Metoprolol 25mg (hommikul ja õhtul)
   Mida see teeb: Aeglustab südame löögisagedust ja aitab südamel kergemini töötada
   Kui ei võta: Süda töötab liiga kõvasti, seisund halveneb

3. Lisinopril 10mg (hommikul)
   Mida see teeb: Hoiab vererõhku madalal ja aitab südamel
   Kui ei võta: Vererõhk tõuseb, süda peab tegema raskemat tööd

OLULINE: Ärge kunagi lõpetage ravimite võtmist ilma arstiga rääkimata!


═══════════════════════════════════════════════════
MINU KONTAKTID
═══════════════════════════════════════════════════

Teie ravimeeskond:

Kardioloog Dr. Mägi
📞 +372 7XX XXXX
📧 kardioloogia@haigla.ee
Järgmine visiit: 2 nädala päras

Südameõde
📞 +372 7XX XXXX
Nõustamine ja küsimused: E-R 9:00-16:00

${patientData.mentalState === 'anxious' ? 'Psühholoog (emotsionaalne tugi)\n📞 +372 7XX XXXX\n📧 psyhholoogia@haigla.ee\n\n' : ''}Apteek
📞 +372 7XX XXXX
Ravimite küsimused

KIIRABI: 112
Helistage kohe kui:
• Hingeldus muutub äkki palju halvemaks
• Valu rinnus
• Teadvuse kaotus
• Jalad tursuvad kiiresti (üleöö)`;
    } else if (patientData.language === "russian") {
      draft = `═══════════════════════════════════════════════════
ЧТО У МЕНЯ ЕСТЬ
═══════════════════════════════════════════════════

Уважаемый ${patientData.sex === 'male' ? 'господин' : 'госпожа'},

У Вас диагностирована сердечная недостаточность. ${literacyLevel === 'low' ? 'Простыми словами: Ваше сердце не может перекачивать достаточно крови во все части тела.' : 'Это означает, что сердечная мышца ослабла и не может эффективно перекачивать кровь.'}

Результаты Ваших тестов:
• Сила сердца: 35% (норма 55-70%)
• Анализ крови показал высокий уровень стресса сердца
• Ноги отекают, потому что жидкость накапливается в организме

${patientData.mentalState === 'anxious' ? 'Мы понимаем, что этот диагноз может пугать. Ваш врач и медсестры здесь, чтобы помочь Вам. Это поддающееся лечению и контролируемое состояние.' : ''}


═══════════════════════════════════════════════════
КАК МНЕ ЖИТЬ ДАЛЬШЕ
═══════════════════════════════════════════════════

Ваше ежедневное лечение и образ жизни:

Потребление жидкости:
• Пейте не более 2 литров жидкости в день
• Это включает воду, чай, суп, всё

Питание:
• Ешьте мало соли (менее 2 граммов в день)
• Избегайте консервированных продуктов и фастфуда
• Используйте свежие травы вместо соли

Ежедневный контроль:
• Взвешивайтесь каждый день в одно время
• Записывайте вес
• Принимайте лекарства точно как прописал врач

Физическая активность:
• Легкая прогулка 10-15 минут в день
• Отдыхайте, когда чувствуете усталость
• Не делайте тяжелую физическую работу


═══════════════════════════════════════════════════
КАК БУДУТ ВЫГЛЯДЕТЬ СЛЕДУЮЩИЕ 6 МЕСЯЦЕВ
═══════════════════════════════════════════════════

Первые 2 недели:
• Вы будете чувствовать усталость, так как организм адаптируется к лекарствам
• Ноги начнут меньше отекать
• Дыхание станет легче

1-3 месяца:
• Уровень энергии начнет улучшаться
• Вы сможете делать больше без одышки
• Сила сердца может увеличиться до 40-45%

3-6 месяцев:
• Вы снова сможете делать легкую работу в саду или прогулки
• Продолжатся регулярные осмотры у кардиолога
• Лекарства могут быть скорректированы


═══════════════════════════════════════════════════
ЧТО ЭТО ЗНАЧИТ ДЛЯ МОЕЙ ЖИЗНИ
═══════════════════════════════════════════════════

Долгосрочные изменения:

${literacyLevel === 'low' ? 'Вам нужно будет принимать лекарства всю жизнь и следить за своим сердцем. Но многие люди живут хорошей жизнью с сердечной недостаточностью.' : 'Сердечная недостаточность — это хроническое состояние, требующее постоянного лечения и изменения образа жизни. При правильном лечении Вы можете жить полноценной жизнью.'}

Вы сможете:
• Продолжить работу (легкий физический труд)
• Путешествовать (консультируйтесь с врачом перед дальними поездками)
• Быть с семьей и наслаждаться жизнью

Вам нужно будет:
• Принимать лекарства каждый день
• Регулярно проходить осмотры
• Следить за весом и симптомами
• Избегать чрезмерных физических нагрузок


═══════════════════════════════════════════════════
МОИ ЛЕКАРСТВА
═══════════════════════════════════════════════════

1. Фуросемид 40мг (утром)
   Что делает: Помогает вывести лишнюю жидкость из организма
   Если не принимать: Ноги отекают, дыхание затрудняется, жидкость накапливается в легких

2. Метопролол 25мг (утром и вечером)
   Что делает: Замедляет частоту сердечных сокращений и помогает сердцу работать легче
   Если не принимать: Сердце работает слишком усердно, состояние ухудшается

3. Лизиноприл 10мг (утром)
   Что делает: Поддерживает низкое кровяное давление и помогает сердцу
   Если не принимать: Давление повышается, сердце должно работать тяжелее

ВАЖНО: Никогда не прекращайте прием лекарств без разговора с врачом!


═══════════════════════════════════════════════════
МОИ КОНТАКТЫ
═══════════════════════════════════════════════════

Ваша медицинская команда:

Кардиолог Др. Мяги
📞 +372 7XX XXXX
📧 kardiologia@haigla.ee
Следующий визит: через 2 недели

Медсестра кардиологии
📞 +372 7XX XXXX
Консультации и вопросы: Пн-Пт 9:00-16:00

${patientData.mentalState === 'anxious' ? 'Психолог (эмоциональная поддержка)\n📞 +372 7XX XXXX\n📧 psyhholoogia@haigla.ee\n\n' : ''}Аптека
📞 +372 7XX XXXX
Вопросы о лекарствах

СКОРАЯ ПОМОЩЬ: 112
Звоните немедленно, если:
• Одышка внезапно сильно ухудшилась
• Боль в груди
• Потеря сознания
• Ноги быстро отекают (за ночь)`;
    } else {
      draft = `═══════════════════════════════════════════════════
WHAT DO I HAVE
═══════════════════════════════════════════════════

Dear ${patientData.sex === 'male' ? 'Mr.' : patientData.sex === 'female' ? 'Ms.' : ''} Patient,

You have been diagnosed with heart failure. ${literacyLevel === 'low' ? 'In simple terms: Your heart cannot pump enough blood to all parts of your body.' : 'This means your heart muscle has weakened and cannot pump blood effectively.'}

Your test results:
• Heart strength: 35% (normal is 55-70%)
• Blood test showed high levels of heart stress
• Your legs are swollen because fluid is building up in your body

${patientData.mentalState === 'anxious' ? 'We understand this diagnosis may feel frightening. Your doctor and nurses are here to help you. This is a treatable and manageable condition.' : ''}


═══════════════════════════════════════════════════
HOW SHOULD I LIVE NEXT
═══════════════════════════════════════════════════

Your daily treatment and lifestyle:

Fluid intake:
• Drink no more than 2 liters of fluid per day
• This includes water, tea, soup, everything

Diet:
• Eat low salt (less than 2 grams daily)
• Avoid canned foods and fast food
• Use fresh herbs instead of salt

Daily monitoring:
• Weigh yourself every day at the same time
• Write down your weight
• Take your medications exactly as prescribed

Physical activity:
• Light walking 10-15 minutes per day
• Rest when you feel tired
• Do not do heavy physical work


═══════════════════════════════════════════════════
HOW THE NEXT 6 MONTHS OF MY LIFE WILL LOOK LIKE
═══════════════════════════════════════════════════

First 2 weeks:
• You will feel tired as your body adjusts to medications
• Your legs will start to swell less
• Breathing will become easier

1-3 months:
• Energy levels will start improving
• You can do more without feeling breathless
• Heart strength may improve to 40-45%

3-6 months:
• You may be able to do light gardening or walking again
• Regular check-ups with cardiologist continue
• Medications may be adjusted


═══════════════════════════════════════════════════
WHAT DOES IT MEAN FOR MY LIFE
═══════════════════════════════════════════════════

Long-term changes:

${literacyLevel === 'low' ? 'You will need to take medications for life and monitor your heart. But many people live good lives with heart failure.' : 'Heart failure is a chronic condition that requires ongoing treatment and lifestyle adjustments. With proper treatment, you can live a fulfilling life.'}

You can:
• Continue working (light physical work)
• Travel (consult doctor before long trips)
• Be with family and enjoy life

You need to:
• Take medications every day
• Have regular check-ups
• Monitor your weight and symptoms
• Avoid excessive physical strain


═══════════════════════════════════════════════════
MY MEDICATIONS
═══════════════════════════════════════════════════

1. Furosemide 40mg (morning)
   What it does: Helps remove extra fluid from your body
   If you don't take it: Legs swell, breathing becomes harder, fluid builds up in lungs

2. Metoprolol 25mg (morning and evening)
   What it does: Slows heart rate and helps your heart work more easily
   If you don't take it: Heart works too hard, condition worsens

3. Lisinopril 10mg (morning)
   What it does: Keeps blood pressure low and helps your heart
   If you don't take it: Blood pressure rises, heart has to work harder

IMPORTANT: Never stop taking medications without talking to your doctor!


═══════════════════════════════════════════════════
MY CONTACTS
═══════════════════════════════════════════════════

Your care team:

Cardiologist Dr. Smith
📞 +372 7XX XXXX
📧 cardiology@hospital.ee
Next visit: In 2 weeks

Heart Failure Nurse
📞 +372 7XX XXXX
Advice and questions: Mon-Fri 9:00-16:00

${patientData.mentalState === 'anxious' ? 'Psychologist (emotional support)\n📞 +372 7XX XXXX\n📧 psychology@hospital.ee\n\n' : ''}Pharmacy
📞 +372 7XX XXXX
Medication questions

${patientData.includeRelatives ? '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nFOR FAMILY MEMBERS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nHow you can help:\n• Help monitor daily weight\n• Encourage fluid and salt restrictions\n• Watch for warning signs (increased swelling, breathing difficulty)\n• Support medication compliance\n• Attend appointments when possible\n\n' : ''}EMERGENCY: 112
Call immediately if:
• Breathing suddenly becomes much worse
• Chest pain
• Loss of consciousness
• Legs swell rapidly (overnight)`;
    }
    
    return draft;
  };

  const handleContinue = async () => {
    if (analysis) {
      const draft = generatePatientFriendlyDraft();
      onNext(draft, analysis);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-medical-note', {
        body: { technicalNote, patientData }
      });

      if (error) {
        toast({
          title: "Analysis failed",
          description: error.message || "Could not analyze medical note. Please try again.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      setAnalysis(data.analysis);
      const draft = generatePatientFriendlyDraft();
      
      // Save to database
      const { error: analysisError } = await saveAIAnalysis(caseId, data.analysis, draft);
      if (analysisError) {
        toast({
          title: "Save failed",
          description: "Failed to save AI analysis",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      const { error: updateError } = await updateCase(caseId, { status: 'pending_approval' });
      if (updateError) {
        toast({
          title: "Update failed",
          description: "Failed to update case status",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      toast({
        title: "Success",
        description: "AI analysis complete!"
      });
      onNext(draft, data.analysis);
    } catch (error) {
      console.error("Error analyzing note:", error);
      toast({
        title: "Analysis error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
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
                <Button 
                  onClick={handleContinue} 
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing document...</span>
                    </>
                  ) : (
                    <span>Review Draft</span>
                  )}
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