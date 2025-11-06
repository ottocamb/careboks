import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CaseData {
  id?: string;
  technicalNote?: string;
  uploadedFileNames?: string[];
  status?: 'draft' | 'processing' | 'pending_approval' | 'approved' | 'completed';
}

export interface PatientProfileData {
  age: string;
  sex: string;
  language: string;
  healthLiteracy: string;
  journeyType: string;
  riskAppetite: string;
  hasAccessibilityNeeds: boolean;
  includeRelatives: boolean;
  mentalState: string;
  comorbidities: string[];
}

export const useCasePersistence = () => {
  const createCase = async (technicalNote: string, uploadedFileNames: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Ensure profile exists before creating case
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || "",
            first_name: "",
            last_name: ""
          });

        if (profileError) throw profileError;
      }

      const { data, error } = await supabase
        .from('patient_cases')
        .insert({
          created_by: user.id,
          technical_note: technicalNote,
          uploaded_file_names: uploadedFileNames,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating case:', error);
      return { data: null, error };
    }
  };

  const updateCase = async (caseId: string, updates: Partial<CaseData>) => {
    try {
      const updateData: any = {};
      if (updates.technicalNote !== undefined) updateData.technical_note = updates.technicalNote;
      if (updates.uploadedFileNames !== undefined) updateData.uploaded_file_names = updates.uploadedFileNames;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('patient_cases')
        .update(updateData)
        .eq('id', caseId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating case:', error);
      return { data: null, error };
    }
  };

  const savePatientProfile = async (caseId: string, profileData: PatientProfileData) => {
    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .insert({
          case_id: caseId,
          age_bracket: profileData.age,
          sex: profileData.sex,
          language: profileData.language,
          health_literacy: profileData.healthLiteracy,
          journey_type: profileData.journeyType,
          risk_appetite: profileData.riskAppetite,
          has_accessibility_needs: profileData.hasAccessibilityNeeds,
          include_relatives: profileData.includeRelatives,
          mental_state: profileData.mentalState,
          comorbidities: profileData.comorbidities
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving patient profile:', error);
      return { data: null, error };
    }
  };

  const saveAIAnalysis = async (caseId: string, analysisData: any, aiDraftText: string, modelUsed: string = 'gemini-2.5-pro') => {
    try {
      const { data, error } = await supabase
        .from('ai_analyses')
        .insert({
          case_id: caseId,
          analysis_data: analysisData,
          ai_draft_text: aiDraftText,
          model_used: modelUsed
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving AI analysis:', error);
      return { data: null, error };
    }
  };

  const saveApproval = async (caseId: string, approvedText: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('approvals')
        .insert({
          case_id: caseId,
          approved_by: user.id,
          approved_text: approvedText,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving approval:', error);
      return { data: null, error };
    }
  };

  const loadCase = async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_cases')
        .select(`
          *,
          patient_profiles (*),
          ai_analyses (*),
          approvals (*)
        `)
        .eq('id', caseId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error loading case:', error);
      return { data: null, error };
    }
  };

  const getCaseHistory = async (limit: number = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('patient_cases')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching case history:', error);
      return { data: null, error };
    }
  };

  return {
    createCase,
    updateCase,
    savePatientProfile,
    saveAIAnalysis,
    saveApproval,
    loadCase,
    getCaseHistory
  };
};
