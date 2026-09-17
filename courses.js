/* =========================================================
   课程内容 —— 在这里增删场景和句子，保存后刷新页面即可
   ---------------------------------------------------------
   场景格式：
     {id:"唯一英文id", name:"显示名称", note:"一句说明", items:[
       ["英文句子", "中文意思"],
       ["英文句子", "中文意思"]
     ]},
   注意：每行末尾的英文逗号不能漏；句子里如果有英文双引号 " 要写成 \"
   ========================================================= */
window.COURSES = {
  scenes: [
  {id:"hello", name:"打招呼", note:"见面、寒暄、介绍自己。", items:[
    ["Hi, how are you?","你好，最近怎么样？"],["I'm good, thanks. And you?","挺好的，谢谢。你呢？"],
    ["Nice to meet you.","很高兴认识你。"],["My name is Tom.","我叫 Tom。"],["I'm from China.","我来自中国。"],
    ["What do you do?","你是做什么工作的？"],["How's it going?","最近怎么样？（更随意）"],["Long time no see.","好久不见。"],
    ["Have a nice day.","祝你今天愉快。"],["See you later.","回头见。"],["Take care.","保重。"],["Good night.","晚安。"]]},
  {id:"polite", name:"万能短句", note:"一天里说得最多的几句，先练这些。", items:[
    ["Thank you so much.","太感谢了。"],["You're welcome.","不客气。"],["No problem.","没问题。"],["No worries.","没事，别在意。"],
    ["Excuse me.","打扰一下 / 借过。"],["Sorry, my bad.","抱歉，是我的错。"],["Of course.","当然。"],["Sounds good.","好啊 / 可以。"],
    ["Me too.","我也是。"],["I'm not sure.","我不太确定。"],["Just a moment, please.","请稍等。"],["That's OK.","没关系。"]]},
  {id:"help", name:"听不懂时", note:"零基础最重要的一组：听不懂也能把对话接下去。", items:[
    ["Sorry, I don't understand.","抱歉，我没听懂。"],["Could you say that again?","能再说一遍吗？"],
    ["Could you speak more slowly?","能说慢一点吗？"],["What does this word mean?","这个词是什么意思？"],
    ["How do you say this in English?","这个用英语怎么说？"],["Can you write it down?","能写下来吗？"],
    ["I'm still learning English.","我还在学英语。"],["Do you mean tomorrow?","你是说明天吗？"],
    ["Let me think.","让我想想。"],["I got it.","我明白了。"]]},
  {id:"food", name:"吃饭点餐", note:"餐厅、咖啡店、快餐店。", items:[
    ["A table for two, please.","两位，谢谢。"],["Can I see the menu?","能看下菜单吗？"],["What do you recommend?","你推荐什么？"],
    ["I'd like this one.","我要这个。"],["Not spicy, please.","请不要辣。"],["Can I get a coffee?","我要一杯咖啡。"],
    ["For here or to go?","堂食还是带走？"],["To go, please.","带走，谢谢。"],["Could I have some water?","能给我点水吗？"],
    ["The check, please.","买单。"],["It's delicious.","很好吃。"],["I'm full.","我吃饱了。"]]},
  {id:"shop", name:"购物付款", note:"逛店、网购、结账。", items:[
    ["How much is this?","这个多少钱？"],["I'm just looking.","我随便看看。"],["Do you have a smaller size?","有小一号的吗？"],
    ["Do you have this in black?","这个有黑色的吗？"],["Can I try it on?","可以试穿吗？"],["It's too expensive.","太贵了。"],
    ["Is there a discount?","有折扣吗？"],["I'll take it.","我买了。"],["Can I pay by card?","可以刷卡吗？"],
    ["Can I get a receipt?","可以给我小票吗？"],["Can I return it?","可以退货吗？"],["Where is the checkout?","在哪里结账？"]]},
  {id:"travel", name:"出行问路", note:"打车、地铁、找地方。", items:[
    ["Where is the subway station?","地铁站在哪？"],["How do I get to the airport?","去机场怎么走？"],["Is it far from here?","离这远吗？"],
    ["Go straight.","直走。"],["Turn left.","左转。"],["It's on your right.","在你右手边。"],["How long does it take?","要多长时间？"],
    ["I'm lost.","我迷路了。"],["Can you show me on the map?","能在地图上指给我看吗？"],
    ["Please take me to this address.","请送我到这个地址。"],["The traffic is bad today.","今天堵车。"],["I'm running late.","我要迟到了。"]]},
  {id:"time", name:"时间数字", note:"约时间、说数字，最容易听错的部分。", items:[
    ["What time is it?","现在几点？"],["It's half past eight.","八点半。"],["See you at seven.","七点见。"],
    ["What day is it today?","今天星期几？"],["It's Monday.","星期一。"],["This weekend.","这个周末。"],["Next week.","下周。"],
    ["In ten minutes.","十分钟后。"],["It's fifteen, not fifty.","是十五，不是五十。"],["What's your phone number?","你电话号码多少？"],
    ["How many people?","几个人？"]]},
  {id:"web", name:"上网界面", note:"网站和 App 按钮上天天见的词，认识就够，不用会说。", items:[
    ["Sign up","注册"],["Sign in","登录（也常写作 Log in）"],["Log out","退出登录"],["Password","密码"],
    ["Forgot password?","忘记密码？"],["Verify your email","验证你的邮箱"],["Settings","设置"],["Search","搜索"],
    ["Download","下载"],["Upload","上传"],["Share","分享"],["Save","保存"],["Cancel","取消"],["Delete","删除"],
    ["Submit","提交"],["Next","下一步"],["Back","返回"],["Subscribe","订阅"],["Notifications","通知"],
    ["Accept cookies","接受 Cookie（网站记录你的浏览）"],["Terms of Service","服务条款"],
    ["Something went wrong.","出错了。"],["Try again.","再试一次。"],["Page not found.","页面不存在。"]]},
  {id:"chat", name:"聊天评论", note:"社交软件、评论区、游戏里的常见说法和缩写。", items:[
    ["LOL — laughing out loud","笑死 / 哈哈"],["BTW — by the way","顺便说一下"],["TBH — to be honest","说实话"],
    ["IMO — in my opinion","我觉得"],["IDK — I don't know","不知道"],["ASAP — as soon as possible","尽快"],
    ["Thanks for sharing!","感谢分享！"],["I totally agree.","完全同意。"],["That's so cool!","太酷了！"],
    ["Same here.","我也是。"],["Check this out.","快看这个。"],["Can you send me the link?","能发我链接吗？"],
    ["Just kidding.","开玩笑的。"],["Good question.","好问题。"]]}
  ],

  weeks: [
  ["发音 + 打招呼","打招呼、万能短句。耳朵先习惯英语的节奏，不求听懂每个词。"],
  ["听不懂时 + 时间数字","学会“请再说一遍”，再把数字和时间听熟。"],
  ["吃饭点餐","能自己点一杯咖啡、一顿饭。"],
  ["购物付款","问价、试穿、结账、退货。"],
  ["出行问路","问路、打车、听懂左转右转。"],
  ["上网界面","注册、登录、设置，外文网站和 App 不再发怵。"],
  ["聊天评论","看懂评论区和聊天里的缩写，能回一两句。"],
  ["综合复习","全部场景连播；广播换到下一阶段的节目。"]
  ]
};
