import { Account, Client, Databases, ID, Query, Storage, Avatars } from 'react-native-appwrite';

export const config = {

}

const client = new Client();

client
    .setEndpoint(config.endpoint) 
    .setProject(config.projectId) 
    .setPlatform(config.platform) 

    const account = new Account(client);
    const databases = new Databases(client);
    const storage = new Storage(client);
    const avatars = new Avatars(client);

    
// ---------------------------------------
// Rejestracja i Logowanie
// ---------------------------------------

export const createUser = async (email, password, username) => {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        username
      );
  
      if (!newAccount) throw Error;
  
      const avatarUrl = avatars.getInitials(username);
  
      await signIn(email, password);
  
      const newUser = await databases.createDocument(
        config.databaseId,
        config.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email,
          username,
          avatar: avatarUrl
        }
      )

      return newUser;

    } catch (error) {
      throw new Error(error);
    }
  }

export const signIn = async(email, password)=> {
    try {
      const session = await account.createEmailPasswordSession(email, password)
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }


  export const getCurrentUser =  async () => {
    try {
      const currentAccount = await account.get();
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
  
      if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  export const logout = async () => {
    try {
      await account.deleteSession('current'); 
      console.log('User logged out successfully.');
    } catch (error) {
      console.error('Error while logging out:', error);
      throw new Error('Failed to log out');
    }
  };
  

// ---------------------------------------
// Obsługa wiadomości
// ---------------------------------------

export const isNewsIdUnique = async (newsId) => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.saved_newsCollectionId,
      [Query.equal('newsId', newsId)]
    );

    return response.documents.length === 0; 
  } catch (error) {
    console.error('Error checking newsId uniqueness:', error);
    throw error;
  }
};

export const saveNews = async (newsData, accountId) => {
  const { title, newsId, description, link, linkPhoto } = newsData;

  if (!title || !newsId || !description || !link) {
    console.error('Invalid news data provided.');
    return { message: 'Invalid data', success: false };
  }

  try {
    // czy news został już zapisany przez użytkownika
    const response = await databases.listDocuments(
      config.databaseId,
      config.saved_newsCollectionId,
      [Query.equal('newsId', newsId), Query.equal('users', accountId)]
    );

    if (response.documents.length > 0) {
      console.log('News already exists in the database for this user.');
      return { message: 'News already saved', success: false };
    }

    const newDocument = await databases.createDocument(
      config.databaseId,
      config.saved_newsCollectionId,
      ID.unique(),
      {
        title,
        newsId,
        description,
        link,
        linkPhoto,
        isFavourite: false,
        users: accountId, 
      }
    );

    console.log('News saved:', newDocument);
    return { message: 'News saved successfully', success: true, data: newDocument };
  } catch (error) {
    console.error('Error saving news:', error);
    throw new Error('Error saving news');
  }
};

export const getSavedNews = async (accountId) => {
  try {
    console.log('Pobieranie zapisanych wiadomości dla accountId:', accountId);
    const response = await databases.listDocuments(
      config.databaseId,
      config.saved_newsCollectionId,
      [Query.equal('users', accountId)] 
    );

    console.log('Zapisane wiadomości:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching saved news:', error);
    throw error;
  }
};

export const deleteSavedNews = async (newsId) => {
  try {
    await databases.deleteDocument(
      config.databaseId,
      config.saved_newsCollectionId,
      newsId
    );
  } catch (error) {
    console.error('Error deleting saved news:', error);
    throw error;
  }
};
