export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
        Relationships: any[];
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
        Relationships: any[];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      message_type: "text" | "image" | "audio" | "music" | "file";
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: Record<string, any>;
    };
  };
};
