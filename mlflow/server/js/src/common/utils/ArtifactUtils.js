import { ErrorWrapper } from './ErrorWrapper';
import { getDefaultHeaders, HTTPMethods } from './FetchUtils';

/**
 * Async function to fetch and return the specified artifact blob from response.
 * Throw exception if the request fails.
 */
export async function getArtifactBlob(artifactLocation) {
  const getArtifactRequest = new Request(artifactLocation, {
    method: HTTPMethods.GET,
    redirect: 'follow',
    headers: new Headers(getDefaultHeaders(document.cookie)),
  });
  const response = await fetch(getArtifactRequest);

  if (!response.ok) {
    const errorMessage = (await response.text()) || response.statusText;
    throw new ErrorWrapper(errorMessage, response.status);
  }
  return response.blob();
}

/**
 * Fetches the specified artifact, returning a Promise that resolves with
 * the raw content converted to text of the artifact if the fetch is
 * successful, and rejects otherwise
 */
export function getArtifactContent(artifactLocation, isBinary = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const blob = await getArtifactBlob(artifactLocation);

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        // Resolve promise with artifact contents
        resolve(event.target.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      if (isBinary) {
        fileReader.readAsArrayBuffer(blob);
      } else {
        fileReader.readAsText(blob);
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

/**
 * Fetches the specified artifact, returning a Promise that resolves with
 * the raw content in bytes of the artifact if the fetch is successful, and rejects otherwise
 */
export function getArtifactBytesContent(artifactLocation) {
  return getArtifactContent(artifactLocation, true);
}
