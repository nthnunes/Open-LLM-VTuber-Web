/**
 * Simple token loader for Twitch .pkl files
 * This is a basic implementation - in production you'd need proper pickle parsing
 */

export async function loadTwitchToken(): Promise<string | null> {
  try {
    // Try to load the token from the pkl file
    const response = await fetch('/twitch-tokens/nthnunes.pkl');
    if (!response.ok) {
      console.error('Token file not found');
      return null;
    }

    const data = await response.text();
    
    // Simple regex to extract oauth token
    // This is a basic implementation - real .pkl files need proper parsing
    const tokenMatch = data.match(/oauth:([a-zA-Z0-9]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }

    // Try to find token without oauth: prefix
    const tokenMatch2 = data.match(/([a-zA-Z0-9]{30,})/);
    if (tokenMatch2) {
      return tokenMatch2[1];
    }

    console.error('No valid token found in file');
    return null;
  } catch (error) {
    console.error('Error loading token:', error);
    return null;
  }
}
