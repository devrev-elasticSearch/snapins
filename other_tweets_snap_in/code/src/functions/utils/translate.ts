import axios from 'axios';

export async function translate(apiKey:string,text: string, targetLanguage: string): Promise<string> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    try {
        const response = await axios.post(url, {
            q: text,
            target: targetLanguage
        });
        
        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return text; // Return the original text in case of error
    }
}
