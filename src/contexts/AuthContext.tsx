import { createContext, useEffect, useState, ReactNode } from 'react';
import { authInstance, firestore } from '../db/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';

// Define a estrutura do objeto User para o usuário no sistema
interface User {
  email: string;
  id?: string;
  password?: string;
  name?: string;
  phone?: string;
}

// Define a estrutura do objeto Post
interface Post {
  adotado: boolean;
  description: string;
  id?: string;
  image: string;
  name: string;
  title: string;
  user_id: string;
  genero: string;
}

// Define a estrutura e métodos do contexto de autenticação
interface AuthContextData {
  user: User | null;
  signed: boolean;
  signOutApp: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  updateUser: (data: User, id: string) => Promise<boolean>;
  createUser: (data: User) => Promise<boolean>;
  createPost: (data: Post) => Promise<boolean>;
  editPost: (postId: string, updatedData: Partial<Post>) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  markAsAdopted: (postId: string) => Promise<boolean>;
}

// Cria o contexto de autenticação com valores padrão
export const AuthContext = createContext<AuthContextData>({
  signed: false,
  user: null,
  signOutApp: async () => { },
  login: async () => false,
  updateUser: async () => false,
  createUser: async () => false,
  createPost: async () => false,
  editPost: async () => false,
  deletePost: async () => false,
  markAsAdopted: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'user_data'; // Define uma chave para armazenar dados do usuário localmente

// Componente que provê o contexto de autenticação para a aplicação
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega os dados do usuário do armazenamento local
  const loadUserData = async () => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user data from storage', error);
    }
  };

  // Salva ou remove os dados do usuário do armazenamento local
  const saveUserData = async (data: User | null) => {
    try {
      if (data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save user data to storage', error);
    }
  };

  // Função para criar um novo usuário e salvá-lo no Firestore
  const createUser = async (data: User) => {
    try {
      const create = await createUserWithEmailAndPassword(authInstance, data.email, data.password || '');
      const userDoc = doc(collection(firestore, 'users'), create.user.uid);

      const userData: User = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        id: create.user.uid,
      };

      await setDoc(userDoc, userData); // Salva os dados do usuário na coleção 'users' no Firestore
      setUser(userData);
      await saveUserData(userData); // Salva os dados do usuário localmente
      return true;
    } catch (error) {
      console.error('Create user error', error);
      return false;
    }
  };

  // Função para realizar login do usuário com email e senha
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const userDoc = doc(collection(firestore, 'users'), userCredential.user.uid);
      const docSnapshot = await getDoc(userDoc);

      if (!docSnapshot.exists()) {
        console.log('No such user!');
        return false;
      }

      const userData: User = { ...docSnapshot.data(), id: userCredential.user.uid } as User;
      setUser(userData);
      await saveUserData(userData);
      return true;
    } catch (error) {
      console.error('Login error', error);
      return false;
    }
  };

  // Função para atualizar os dados de um usuário específico no Firestore
  const updateUser = async (data: User, id: string) => {
    try {
      const userDoc = doc(collection(firestore, 'users'), id);
      await updateDoc(userDoc, { ...data });
      setUser(data);
      await saveUserData(data); // Atualiza os dados localmente
      return true;
    } catch (error) {
      console.error('Update user error', error);
      return false;
    }
  };

  // Função para desconectar o usuário da aplicação
  const signOutApp = async () => {
    try {
      await signOut(authInstance);
      setUser(null);
      await saveUserData(null);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  // Função para criar um novo post
  const createPost = async (data: Post) => {
    try {
      if (!user) {
        throw new Error("User must be logged in to create a post");
      }
      
      const postRef = await addDoc(collection(firestore, 'posts'), {
        ...data,
        user_id: user.id,  // Relacionando com o usuário logado
        adotado: data.adotado || false, // Valor padrão caso adotado não seja definido
      });

      console.log('Post criado com sucesso:', postRef.id);
      return true;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      return false;
    }
  };

  // Função para editar um post existente
  const editPost = async (postId: string, updatedData: Partial<Post>) => {
    try {
      const postDoc = doc(firestore, 'posts', postId);
      await updateDoc(postDoc, updatedData); // Atualiza os dados do post
      console.log('Post editado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao editar post:', error);
      return false;
    }
  };

  // Função para deletar um post
  const deletePost = async (postId: string) => {
    try {
      const postDoc = doc(firestore, 'posts', postId);
      await deleteDoc(postDoc); // Deleta o post
      console.log('Post deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      return false;
    }
  };

  // Função para modificar o valor de 'adotado' de false para true
  const markAsAdopted = async (postId: string) => {
    try {
      const postDoc = doc(firestore, 'posts', postId);
      await updateDoc(postDoc, { adotado: true }); // Modifica o valor de 'adotado' para true
      console.log('Post marcado como adotado');
      return true;
    } catch (error) {
      console.error('Erro ao marcar post como adotado:', error);
      return false;
    }
  };

  // Executa quando o estado de autenticação muda (usuário faz login ou logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = doc(collection(firestore, 'users'), firebaseUser.uid);
          const docSnapshot = await getDoc(userDoc);

          if (!docSnapshot.exists()) {
            console.log('No such user!');
            return false;
          }

          const userData: User = { ...docSnapshot.data(), id: firebaseUser.uid } as User;
          await saveUserData(userData); // Salva o estado de autenticação do usuário
          setUser(userData);
        } else {
          setUser(null);
          await saveUserData(null);
        }
      } catch (error) {
        console.error('Error during authentication state change', error);
      }
    });

    loadUserData(); // Carrega os dados do usuário armazenados localmente
    setLoading(false);

    return () => unsubscribe(); // Limpa o listener de autenticação quando o componente é desmontado
  }, []);

  // Exibe uma tela de carregamento enquanto o contexto é inicializado
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        signOutApp,
        login,
        createUser,
        updateUser,
        createPost,
        editPost,
        deletePost,
        markAsAdopted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
