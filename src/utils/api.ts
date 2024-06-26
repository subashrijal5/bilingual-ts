import { config } from "../config/config";
import { BilingualError } from "../errors/BilingualError";
import {
	LanguageType,
	ProjectType,
	ResponseType,
	SingleStringGroup,
	SingleStringType,
} from "../types/get-text";

export class ApiClient {
	protected token: string;
	protected baseUrl: string;

	constructor(token: string, baseUrl: string) {
		this.token = token;
		this.baseUrl = baseUrl;
	}

	/**
   * get the project by making a GET request to the project URL with the provided API key.
   *
   * @throws {Error} If an error occurs during the request or if the API key is invalid.
   */
	public async getProject(): Promise<ResponseType<ProjectType>> {

		const projectUrl = new URL(this.baseUrl + "/api/projects");
		const response = await fetch(projectUrl, {
			method: "GET",
			headers: {
				"X-PROJECT-KEY": this.token,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			throw new BilingualError(response.status, "Invalid api key", {
				response: await response.json(),
			});
		}
		return response.json();
		
	}

	/**
   * Retrieves the languages used in a project.
   *
   * @returns {Promise<object>} The languages used in the project, returned as JSON data.
   *
   * @example
   * const apiClient = new ApiClient(token, baseUrl);
   * const languages = await apiClient.getProjectLanguages();
   * console.log(languages);
   */
	public async getProjectLanguages(): Promise<LanguageType[]> {
		const languageUrl = new URL(this.baseUrl + "/api/projects/languages");
		const response = await fetch(languageUrl, {
			method: "GET",
			headers: {
				"X-PROJECT-KEY": this.token,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			throw new BilingualError(response.status, "Error retrieving project languages", {
				response: await response.json(),
			});
		}
		return response.json();
	}

	/**
   * Retrieves the language strings for a specific language in a project.
   *
   * @param language - The language code for which to retrieve the language strings.
   * @returns A Promise that resolves to an object representing the language strings for the specified language.
   *
   * @example
   * const apiClient = new ApiClient(token, baseUrl);
   * const language = "en";
   * const languageStrings = await apiClient.getLanguageStrings(language);
   * console.log(languageStrings);
   */
	public async getLanguageStrings(
		language: string,
	): Promise<SingleStringType[] | SingleStringGroup> {
		const languageUrl = new URL(
			this.baseUrl + "/api/projects/languages/" + language + "/strings",
		);
		languageUrl.searchParams.append("grouped", config.GROUPED);

		const response = await fetch(languageUrl, {
			method: "GET",
			headers: {
				"X-PROJECT-KEY": this.token,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
		return response.json();
	}

	/**
	 * Push the language strings to the server.	
	 * @param langCode The language code of the language to push the strings to.
	 * @returns A Promise that resolves to the response from the server.
	 * 
	 **/
	public async pushLanguageString(langCode:string, strings: Array<Record<string, string>>) {
		const pushUrl = new URL(`${this.baseUrl}/api/projects/languages/${langCode}/sync-strings`);
		const response = await fetch(pushUrl, {
			method: "POST",
			headers: {
				"X-PROJECT-KEY": this.token,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				strings: strings,
			})
		});
		if (!response.ok) {
			throw new BilingualError(response.status, "Error pushing language strings", {
				response: await response.json(),
			});
		}
		return response.json();
	}
}
