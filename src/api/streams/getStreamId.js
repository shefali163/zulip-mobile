/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseStreamId = {|
  ...ApiResponseSuccess,
  stream_id: number,
|};

/** See https://zulipchat.com/api/get-stream-id */
export default async (auth: Auth, stream: string): Promise<ApiResponseStreamId> =>
  apiGet(auth, 'get_stream_id', res => res, { stream });
