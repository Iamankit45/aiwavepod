import { action } from "./_generated/server";
import { v } from "convex/values";
import axios, { AxiosError } from 'axios';

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY!;
const AZURE_REGION = process.env.AZURE_REGION!;
const endpoint = `https://centralindia.api.cognitive.microsoft.com/`;

export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
    const headers = {
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
    };

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">${input}</voice>
      </speak>
    `;

    try {
      console.log("Sending request to Azure TTS API...");
      const response = await axios.post(endpoint, ssml, { headers, responseType: 'arraybuffer' });
      console.log("Response received from Azure TTS API");

      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          const arrayBufferView = new Uint8Array(error.response.data);
          const errorString = new TextDecoder().decode(arrayBufferView);
          try {
            const errorJson = JSON.parse(errorString);
            errorMessage = errorJson.error.message || errorJson.error || errorString;
          } catch {
            errorMessage = errorString;
          }
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = error.message;
      }

      console.error("Error from Azure TTS API:", errorMessage);
      throw new Error(`Azure TTS API request failed: ${errorMessage}`);
    }
  },
});
