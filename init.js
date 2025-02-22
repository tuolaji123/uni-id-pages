// 导入配置
import config from '@/uni_modules/uni-id-pages/config.js'
// uni-id的云对象
const uniIdCo = uniCloud.importObject('uni-id-co', {
  customUI: true
})
// 用户配置的登录方式、是否打开调试模式
const {
  loginTypes,
  debug
} = config

export default async function () {
	console.log("是否为调试模式：",debug)
  // 有打开调试模式的情况下
  if (debug) {
    // 1. 检查本地uni-id-pages中配置的登录方式，服务器端是否已经配置正确。否则提醒并引导去配置
    // 调用云对象，获取服务端已正确配置的登录方式
    const {
      supportedLoginType
    } = await uniIdCo.getSupportedLoginType()
    console.log('supportedLoginType: ' + JSON.stringify(supportedLoginType))
    // 登录方式，服务端和客户端的映射关系
    const data = {
      smsCode: 'mobile-code',
      univerify: 'univerify',
      username: 'username-password',
      weixin: 'weixin',
      qq: 'qq',
      xiaomi: 'xiaomi',
      sinaweibo: 'sinaweibo',
      taobao: 'taobao',
      facebook: 'facebook',
      google: 'google',
      alipay: 'alipay',
      apple: 'apple',
      weixinMobile: 'weixin'
    }
    // 遍历客户端配置的登录方式，与服务端比对。并在错误时抛出错误提示
    const list = loginTypes.filter(type => !supportedLoginType.includes(data[type]))
	console.log('登录配置: ' + JSON.stringify(list))
    if (list.length) {
      console.error(
				`错误：前端启用的登录方式:${list.join('，')};没有在服务端完成配置。配置文件路径："/uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json"`
      )
    }
  }

  // #ifdef APP-PLUS
  // 如果uni-id-pages配置的登录功能有一键登录，有则执行预登录（异步）
  if (loginTypes.includes('univerify')) {
    uni.preLogin({
      provider: 'univerify',
      complete: e => {
        // console.log(e);
      }
    })
  }
  // #endif

  // 3. 绑定clientDB错误事件
  // clientDB对象
  const db = uniCloud.database()
  db.on('error', onDBError)
  // clientDB的错误提示
  function onDBError ({
    code, // 错误码详见https://uniapp.dcloud.net.cn/uniCloud/clientdb?id=returnvalue
    message
  }) {
    // console.error('onDBError', {code,message});
  }
  // 解绑clientDB错误事件
  // db.off('error', onDBError)


}
