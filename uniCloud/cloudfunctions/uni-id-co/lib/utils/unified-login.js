const {
	checkLoginUserRecord,
	postLogin
} = require('./login')
const {
	postRegister
} = require('./register')
const {
	findUser
} = require('./account')
const {
	ERROR
} = require('../../common/error')

async function realPreUnifiedLogin(params = {}) {
	const {
		user,
		type
	} = params;
	const appId = this.getUniversalClientInfo().appId;
	const {
		total,
		userMatched
	} = await findUser({
		userQuery: user,
		authorizedApp: appId
	});
	console.log("匹配到的用户:", userMatched);
	if (userMatched.length === 0) {
		if (type === 'login') {
			if (total > 0) {
				throw {
					errCode: ERROR.ACCOUNT_NOT_EXISTS_IN_CURRENT_APP
				};
			}
			throw {
				errCode: ERROR.ACCOUNT_NOT_EXISTS
			};
		}
		return {
			type: 'register',
			user
		};
	} else if (userMatched.length === 1) {
		// Check if the matched user's phone is the same as the one trying to login
		const userRecord = userMatched[0];
		if (userRecord.mobile === user.mobile) { // Assuming 'mobile' is part of user query
			console.log("检测到号码一样");
			checkLoginUserRecord(userRecord);
			return {
				type: 'login',
				user: userRecord
			};
		} else {
			throw {
				errCode: ERROR.ACCOUNT_EXISTS
			};
		}
	} else if (userMatched.length > 1) {
		throw {
			errCode: ERROR.ACCOUNT_CONFLICT
		};
	}
}


async function preUnifiedLogin(params = {}) {
	try {
		const result = await realPreUnifiedLogin.call(this, params)
		return result
	} catch (error) {
		await this.middleware.uniIdLog({
			success: false
		})
		throw error
	}
}

async function postUnifiedLogin(params = {}) {
	const {
		user,
		extraData = {},
		isThirdParty = false,
		type,
		inviteCode
	} = params
	let result
	if (type === 'login') {
		result = await postLogin.call(this, {
			user,
			extraData,
			isThirdParty
		})
	} else if (type === 'register') {
		result = await postRegister.call(this, {
			user,
			extraData,
			isThirdParty,
			inviteCode
		})
	}
	return {
		...result,
		type
	}
}

module.exports = {
	preUnifiedLogin,
	postUnifiedLogin
}