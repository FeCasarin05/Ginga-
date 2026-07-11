// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

// IMPORTANTE: O usuário precisa substituir essas variáveis com as chaves reais do projeto no Supabase
const SUPABASE_URL = 'https://fglpuhiwjmtvfobyqedq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHB1aGl3am10dmZvYnlxZWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjQ0NDMsImV4cCI6MjA5OTMwMDQ0M30.gbZ-MdvBGdesAqM0lXazkpscUz2m8oICfPyUZcGb3oE';

// Inicializa o cliente do Supabase
// Requer que a biblioteca do Supabase seja carregada no HTML
let supabase;

try {
  if (window.supabase && SUPABASE_URL !== 'SUA_URL_AQUI') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('Biblioteca do Supabase não encontrada no window.');
  }
} catch (e) {
  console.error('Erro ao inicializar Supabase:', e);
}

// Funções de Autenticação
async function signUp(email, password, apelido) {
  if (!supabase) return { error: { message: 'Supabase não configurado.' } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        apelido: apelido
      }
    }
  });
  return { data, error };
}

async function signIn(email, password) {
  if (!supabase) return { error: { message: 'Supabase não configurado.' } };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = 'login.html';
  }
}

async function checkUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Funções de Progresso
async function saveProgressToCloud(progressData) {
  const user = await checkUser();
  if (!user) return; // Só salva na nuvem se estiver logado

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...progressData,
      updated_at: new Date()
    });

  if (error) {
    console.error("Erro ao salvar progresso na nuvem:", error);
  }
}

async function loadProgressFromCloud() {
  const user = await checkUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("Erro ao carregar progresso da nuvem:", error);
    return null;
  }

  return data;
}

// Exporta as funções para serem usadas no app.js
window.supabaseAPI = {
  signUp,
  signIn,
  signOut,
  checkUser,
  saveProgressToCloud,
  loadProgressFromCloud
};
