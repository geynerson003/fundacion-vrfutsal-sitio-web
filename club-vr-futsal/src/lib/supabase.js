import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase credentials missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// ==================== AUTENTICACIÓN ====================

export const auth = {
  // Iniciar sesión con email y contraseña
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener sesión actual
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Obtener usuario actual
  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ==================== GALERÍA ====================

export const gallery = {
  // Obtener todas las imágenes (públicas activas)
  async getAll() {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  // Obtener todas las imágenes (admin - incluye inactivas)
  async getAllAdmin() {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  // Crear nueva imagen
  async create(imageData) {
    const { data, error } = await supabase
      .from("gallery")
      .insert([imageData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Actualizar imagen
  async update(id, imageData) {
    const { data, error } = await supabase
      .from("gallery")
      .update(imageData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Eliminar imagen
  async delete(id) {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) throw error;
  },

  // Subir imagen al storage
  async uploadImage(file, fileName) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${fileName}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("gallery")
      .upload(filePath, file);

    if (error) throw error;

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery").getPublicUrl(data.path);

    return publicUrl;
  },

  // Listar todas las imágenes del Storage
  async listStorageFiles() {
    const { data, error } = await supabase.storage
      .from("gallery")
      .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

    if (error) throw error;

    // Agregar URL pública a cada archivo
    return (data || [])
      .filter((file) => file.name && !file.name.startsWith("."))
      .map((file) => ({
        ...file,
        publicUrl: supabase.storage.from("gallery").getPublicUrl(file.name).data
          .publicUrl,
      }));
  },

  // Eliminar imagen del Storage
  async deleteStorageFile(fileName) {
    const { error } = await supabase.storage.from("gallery").remove([fileName]);
    if (error) throw error;
  },
};

// ==================== HORARIOS ====================

export const schedules = {
  // Obtener todos los horarios activos
  async getAll() {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  // Obtener todos (admin)
  async getAllAdmin() {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  // Crear nuevo horario
  async create(scheduleData) {
    const { data, error } = await supabase
      .from("schedules")
      .insert([scheduleData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Actualizar horario
  async update(id, scheduleData) {
    const { data, error } = await supabase
      .from("schedules")
      .update(scheduleData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Eliminar horario
  async delete(id) {
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) throw error;
  },
};

// ==================== PATROCINADORES ====================

export const sponsors = {
  // Obtener todos los patrocinadores activos
  async getAll() {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  // Obtener todos (admin)
  async getAllAdmin() {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  // Crear nuevo patrocinador
  async create(sponsorData) {
    const { data, error } = await supabase
      .from("sponsors")
      .insert([sponsorData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Actualizar patrocinador
  async update(id, sponsorData) {
    const { data, error } = await supabase
      .from("sponsors")
      .update(sponsorData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Eliminar patrocinador
  async delete(id) {
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) throw error;
  },

  // Subir logo al storage
  async uploadLogo(file, sponsorName) {
    const fileExt = file.name.split(".").pop();
    const fileName = sponsorName.toLowerCase().replace(/\s+/g, "-");
    const filePath = `${fileName}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("sponsors")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("sponsors").getPublicUrl(data.path);

    return publicUrl;
  },
};

export default supabase;
