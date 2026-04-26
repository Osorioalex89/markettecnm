export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      carrito: {
        Row: {
          cantidad: number | null
          comprador_id: string
          id: string
          producto_id: string
        }
        Insert: {
          cantidad?: number | null
          comprador_id: string
          id?: string
          producto_id: string
        }
        Update: {
          cantidad?: number | null
          comprador_id?: string
          id?: string
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrito_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrito_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      conversaciones: {
        Row: {
          comprador_id: string
          creado_en: string | null
          id: string
          vendedor_id: string
        }
        Insert: {
          comprador_id: string
          creado_en?: string | null
          id?: string
          vendedor_id: string
        }
        Update: {
          comprador_id?: string
          creado_en?: string | null
          id?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imagenes_producto: {
        Row: {
          id: string
          orden: number | null
          producto_id: string
          url: string
        }
        Insert: {
          id?: string
          orden?: number | null
          producto_id: string
          url: string
        }
        Update: {
          id?: string
          orden?: number | null
          producto_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "imagenes_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      items_orden: {
        Row: {
          cantidad: number
          id: string
          orden_id: string
          precio_unit: number
          producto_id: string
        }
        Insert: {
          cantidad: number
          id?: string
          orden_id: string
          precio_unit: number
          producto_id: string
        }
        Update: {
          cantidad?: number
          id?: string
          orden_id?: string
          precio_unit?: number
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_orden_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_orden_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes: {
        Row: {
          contenido: string
          conversacion_id: string
          enviado_en: string | null
          id: string
          leido: boolean | null
          remitente_id: string
        }
        Insert: {
          contenido: string
          conversacion_id: string
          enviado_en?: string | null
          id?: string
          leido?: boolean | null
          remitente_id: string
        }
        Update: {
          contenido?: string
          conversacion_id?: string
          enviado_en?: string | null
          id?: string
          leido?: boolean | null
          remitente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_remitente_id_fkey"
            columns: ["remitente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes: {
        Row: {
          comprador_id: string
          creado_en: string | null
          estado: string | null
          id: string
          punto_entrega: string | null
          total: number
        }
        Insert: {
          comprador_id: string
          creado_en?: string | null
          estado?: string | null
          id?: string
          punto_entrega?: string | null
          total: number
        }
        Update: {
          comprador_id?: string
          creado_en?: string | null
          estado?: string | null
          id?: string
          punto_entrega?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          avatar_url: string | null
          creado_en: string | null
          expo_push_token: string | null
          id: string
          matricula: string | null
          nombre: string
          rol: string
        }
        Insert: {
          avatar_url?: string | null
          creado_en?: string | null
          expo_push_token?: string | null
          id: string
          matricula?: string | null
          nombre: string
          rol: string
        }
        Update: {
          avatar_url?: string | null
          creado_en?: string | null
          expo_push_token?: string | null
          id?: string
          matricula?: string | null
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean | null
          categoria: string | null
          creado_en: string | null
          descripcion: string | null
          id: string
          nombre: string
          precio: number
          stock: number | null
          vendedor_id: string
        }
        Insert: {
          activo?: boolean | null
          categoria?: string | null
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          precio: number
          stock?: number | null
          vendedor_id: string
        }
        Update: {
          activo?: boolean | null
          categoria?: string | null
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          precio?: number
          stock?: number | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
