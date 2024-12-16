import { Account, Client, Databases, ID, Query, Storage, Avatars } from 'react-native-appwrite';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.jsm.news',
  projectId: '6759e9e800016a9493d3',
  databaseId: '6759ed36000b1bd0a3f2',
  userCollectionId: '6759ed6d0039d58d8deb',
  saved_newsCollectionId: '6759edad001f114e73e9',
  storageId: '6759f0b00012c6aad6f3'
}


// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

    const account = new Account(client);
    const databases = new Databases(client);
    const storage = new Storage(client);
    const avatars = new Avatars(client);

    
// ---------------------------------------
// User Registration and Login Functions
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

// Sign In
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

// ---------------------------------------
// Save News Functions
// ---------------------------------------

// Check if newsId is unique
export const isNewsIdUnique = async (newsId) => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.saved_newsCollectionId,
      [Query.equal('newsId', newsId)]
    );

    return response.documents.length === 0; // Returns true if no documents are found
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
    // Sprawdź, czy ten newsId został już zapisany przez użytkownika
    const response = await databases.listDocuments(
      config.databaseId,
      config.saved_newsCollectionId,
      [Query.equal('newsId', newsId), Query.equal('users', accountId)]
    );

    if (response.documents.length > 0) {
      console.log('News already exists in the database for this user.');
      return { message: 'News already saved', success: false };
    }

    // Zapisz nowy artykuł
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
        users: accountId, // Użyj accountId zamiast userId
      }
    );

    console.log('Zapisano wiadomość:', newDocument);
    return { message: 'News saved successfully', success: true, data: newDocument };
  } catch (error) {
    console.error('Error saving news:', error);
    throw new Error('Error saving news');
  }
};

// Get saved news articles for the current user
export const getSavedNews = async (accountId) => {
  try {
    console.log('Pobieranie zapisanych wiadomości dla accountId:', accountId);
    const response = await databases.listDocuments(
      config.databaseId,
      config.saved_newsCollectionId,
      [Query.equal('users', accountId)] // Użyj accountId zamiast userId
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
