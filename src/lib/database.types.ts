/**
 * Hand-written to match supabase/migrations/0001_initial_schema.sql exactly.
 * If the schema changes, update this file to match (or regenerate with
 * `supabase gen types typescript` once the Supabase CLI is set up).
 */

export type UserRole = 'super_admin' | 'staff_admin' | 'client';

export type ApplicationStage =
  | 'documents_requested'
  | 'documents_received'
  | 'application_prepared'
  | 'submitted'
  | 'decision_pending'
  | 'approved'
  | 'refused'
  | 'withdrawn';

export type DocumentStatus =
  | 'required'
  | 'pending'
  | 'received'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'submitted_to_embassy'
  | 'returned';

export type PaymentStatus = 'pending' | 'confirmed' | 'partially_paid' | 'refunded';
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type ContentStatus = 'active' | 'hidden';
export type MasterclassStatus = 'open' | 'sold_out' | 'coming_soon' | 'completed';
export type EnquiryStatus = 'unread' | 'read' | 'converted' | 'no_action';
export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'paid';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          title: string | null;
          status: 'active' | 'suspended';
          created_by: string | null;
          last_login: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          profile_id: string;
          assigned_to: string | null;
          service_type: string;
          selar_order_id: string | null;
          onboarding_complete: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['clients']['Row']> & {
          profile_id: string;
          service_type: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['clients']['Row']>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          client_id: string;
          destination: string | null;
          service_type: string;
          stage: ApplicationStage;
          stage_updated_at: string;
          client_visible_message: string | null;
          admin_notes: string | null;
          awaiting_client: boolean;
          expected_outcome_date: string | null;
          actual_outcome: string | null;
          appointment_date: string | null;
          biometrics_date: string | null;
          interview_date: string | null;
          submission_deadline: string | null;
          decision_date: string | null;
          outcome_testimonial_sent: boolean;
          archived: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['applications']['Row']> & {
          client_id: string;
          service_type: string;
        };
        Update: Partial<Database['public']['Tables']['applications']['Row']>;
        Relationships: [];
      };
      stage_history: {
        Row: {
          id: string;
          application_id: string;
          stage: ApplicationStage;
          changed_at: string;
          changed_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['stage_history']['Row']> & {
          application_id: string;
          stage: ApplicationStage;
        };
        Update: Partial<Database['public']['Tables']['stage_history']['Row']>;
        Relationships: [];
      };
      document_requirements: {
        Row: {
          id: string;
          service_type: string;
          document_name: string;
          required: boolean;
          display_order: number;
        };
        Insert: Partial<Database['public']['Tables']['document_requirements']['Row']> & {
          service_type: string;
          document_name: string;
        };
        Update: Partial<Database['public']['Tables']['document_requirements']['Row']>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          application_id: string;
          document_name: string;
          status: DocumentStatus;
          rejection_reason: string | null;
          file_url: string | null;
          file_uploaded_by: string | null;
          file_uploaded_at: string | null;
          previous_version_url: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['documents']['Row']> & {
          application_id: string;
          document_name: string;
        };
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          client_id: string;
          application_id: string | null;
          sender_id: string;
          body: string;
          read_by_recipient: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
          client_id: string;
          sender_id: string;
          body: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
        Relationships: [];
      };
      consultant_reminders: {
        Row: {
          id: string;
          consultant_id: string;
          client_id: string | null;
          note: string;
          due_date: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['consultant_reminders']['Row']> & {
          consultant_id: string;
          note: string;
        };
        Update: Partial<Database['public']['Tables']['consultant_reminders']['Row']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          client_id: string;
          expected_amount: number;
          amount_paid: number;
          currency: string;
          selar_order_id: string | null;
          selar_product_name: string | null;
          status: PaymentStatus;
          next_due_date: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          client_id: string;
          expected_amount: number;
        };
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
        Relationships: [];
      };
      refunds: {
        Row: {
          id: string;
          payment_id: string;
          amount: number;
          reason: string;
          status: RefundStatus;
          requested_by: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['refunds']['Row']> & {
          payment_id: string;
          amount: number;
          reason: string;
        };
        Update: Partial<Database['public']['Tables']['refunds']['Row']>;
        Relationships: [];
      };
      disputes: {
        Row: {
          id: string;
          client_id: string | null;
          description: string;
          handled_by: string | null;
          resolution: string | null;
          status: 'open' | 'resolved';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['disputes']['Row']> & {
          description: string;
        };
        Update: Partial<Database['public']['Tables']['disputes']['Row']>;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          service_interested: string | null;
          destination: string | null;
          message: string | null;
          status: EnquiryStatus;
          converted_client_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['contact_submissions']['Row']> & {
          full_name: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['contact_submissions']['Row']>;
        Relationships: [];
      };
      tour_packages: {
        Row: {
          id: string;
          name: string;
          destination: string;
          nights: number;
          from_price: number;
          per_person_sharing: boolean;
          categories: string[];
          status: ContentStatus;
          photo_url: string | null;
          display_order: number;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tour_packages']['Row']> & {
          name: string;
          destination: string;
          nights: number;
          from_price: number;
        };
        Update: Partial<Database['public']['Tables']['tour_packages']['Row']>;
        Relationships: [];
      };
      masterclasses: {
        Row: {
          id: string;
          title: string;
          topic: string;
          class_date: string;
          class_time: string;
          format: string;
          price: number;
          seats_total: number;
          seats_remaining: number;
          status: MasterclassStatus;
          booking_link: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['masterclasses']['Row']> & {
          title: string;
          topic: string;
          class_date: string;
          class_time: string;
          format: string;
          price: number;
          seats_total: number;
          seats_remaining: number;
        };
        Update: Partial<Database['public']['Tables']['masterclasses']['Row']>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          client_id: string | null;
          client_name: string;
          destination: string | null;
          service_type: string | null;
          category: string | null;
          quote: string;
          service_tag: string | null;
          status: TestimonialStatus;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['testimonials']['Row']> & {
          client_name: string;
          quote: string;
        };
        Update: Partial<Database['public']['Tables']['testimonials']['Row']>;
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          name: string;
          logo_url: string;
          website_url: string | null;
          display_order: number;
          status: ContentStatus;
        };
        Insert: Partial<Database['public']['Tables']['partners']['Row']> & {
          name: string;
          logo_url: string;
        };
        Update: Partial<Database['public']['Tables']['partners']['Row']>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          target_table: string;
          target_id: string | null;
          detail: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          action: string;
          target_table: string;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>;
        Relationships: [];
      };
      consent_log: {
        Row: {
          id: string;
          profile_id: string;
          document: 'terms' | 'privacy';
          accepted_at: string;
        };
        Insert: Partial<Database['public']['Tables']['consent_log']['Row']> & {
          profile_id: string;
          document: 'terms' | 'privacy';
        };
        Update: Partial<Database['public']['Tables']['consent_log']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
