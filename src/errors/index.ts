import { CatchableError } from './CatchableError';
// TODO proper export

////////////////////////////////////////


////////////////////////////////////////
////////////////////////////////////////

// Other User errors

export class MultipleValuesMismatchError extends CatchableError
{
	constructor( typeA: string, typeB: string, details ?: any )
	{
		const message = `Multiple arguments should be of the same type, not ${ typeA } and ${ typeB }`
		super( message, details )
	}
}
