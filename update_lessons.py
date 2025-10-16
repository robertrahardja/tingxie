#!/usr/bin/env python3

import json

# Define all lesson data
lessons = {
    3: {
        "title": "第三课：巴士站",
        "subtitle": "Bus Station",
        "emoji": "🚌",
        "text": """这张图片描绘的是巴士站里的情景，我想现在应该是下午的时候，这里有很多人，看起来很热闹。

德士门口，一个叔叔正准备上车。叔叔的身后，有一个小男孩和一个小女孩在玩你追我跑。旁边的阿姨看到了，伸出手，想要阻止他们。看到他们的行为，我感到很担心。我认为他们这样做是不对的。在公共场所你追我跑是非常危险的行为，一不小心就可能发生意外。如果当时我在场，我会上前阻止他们，并告诉他们去游乐场玩你追我跑。

不远处，有一个男生在一边走路，一边吃冰淇淋。他随手把包装纸丢在了地上，前面就有一个垃圾桶，他好像没有看见一样。看到男孩的行为，我感到很生气。我认为他这样做是不对的。乱丢垃圾是一种没有公德心的行为，他不应该为了一时方便就乱丢垃圾。如果人人都像他一样，那我们的新加坡就不再那么美好了。""",
        "vocab": [
            {"chinese": "巴士站", "pinyin": "bā shì zhàn", "english": "bus station", "example": "巴士站里有很多人在等巴士。", "image": "https://cdn.pixabay.com/photo/2016/11/23/00/32/bus-1851660_640.jpg"},
            {"chinese": "德士", "pinyin": "dé shì", "english": "taxi", "example": "德士门口，一个叔叔正准备上车。", "image": "https://cdn.pixabay.com/photo/2016/04/05/20/30/taxi-1310342_640.jpg"},
            {"chinese": "叔叔", "pinyin": "shū shu", "english": "uncle", "example": "叔叔的身后有一个小男孩。", "image": "https://cdn.pixabay.com/photo/2017/07/31/11/21/people-2557396_640.jpg"},
            {"chinese": "阿姨", "pinyin": "ā yí", "english": "auntie", "example": "旁边的阿姨看到了，伸出手。", "image": "https://cdn.pixabay.com/photo/2019/03/03/18/04/woman-4032324_640.jpg"},
            {"chinese": "玩你追我跑", "pinyin": "wán nǐ zhuī wǒ pǎo", "english": "play chase", "example": "小男孩和小女孩在玩你追我跑。", "image": "https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg"},
            {"chinese": "伸出", "pinyin": "shēn chū", "english": "reach out", "example": "阿姨伸出手，想要阻止他们。", "image": "https://cdn.pixabay.com/photo/2020/04/12/10/37/hand-5033770_640.jpg"},
            {"chinese": "担心", "pinyin": "dān xīn", "english": "worried", "example": "看到他们的行为，我感到很担心。", "image": "https://cdn.pixabay.com/photo/2018/11/03/00/23/woman-3791573_640.jpg"},
            {"chinese": "公共场所", "pinyin": "gōng gòng chǎng suǒ", "english": "public place", "example": "在公共场所你追我跑是非常危险的。", "image": "https://cdn.pixabay.com/photo/2016/09/10/17/18/park-1659451_640.jpg"},
            {"chinese": "冰淇淋", "pinyin": "bīng qí lín", "english": "ice cream", "example": "男生在一边走路，一边吃冰淇淋。", "image": "https://cdn.pixabay.com/photo/2016/12/26/16/09/ice-cream-1932302_640.jpg"},
            {"chinese": "垃圾桶", "pinyin": "lā jī tǒng", "english": "trash bin", "example": "前面就有一个垃圾桶。", "image": "https://cdn.pixabay.com/photo/2019/03/27/20/17/bin-4085873_640.jpg"},
            {"chinese": "乱丢垃圾", "pinyin": "luàn diū lā jī", "english": "litter", "example": "乱丢垃圾是一种没有公德心的行为。", "image": "https://cdn.pixabay.com/photo/2019/03/20/20/31/trash-4069477_640.jpg"},
            {"chinese": "公德心", "pinyin": "gōng dé xīn", "english": "civic responsibility", "example": "乱丢垃圾是一种没有公德心的行为。", "image": "https://cdn.pixabay.com/photo/2017/06/10/07/29/hand-2389412_640.jpg"}
        ]
    },
    4: {
        "title": "第四课：图书馆",
        "subtitle": "Library",
        "emoji": "📚",
        "text": """这张图片描绘的是图书馆里的情景。我想现在应该是下午的时候，这里有很多同学在安静地看书。

借书处，有很多同学在排队借书，站在前面的小男孩把书交给图书管理员。来子旁，有一个男同学和一个女同学在专心地看书。另一张来子旁，有两个女同学在一边看书，一边大声地讲话，一位图书管理员看见了，连忙上前想要阻止她们。看到这两个女同学的行为，我感到很生气。我认为她们这样做是不对的。这是一种没有公德心的行为，她们应该注意公共场所的基本礼貌，不应该大声吵闹，影响别人。

书架前，有一个大姐姐在帮一个小弟弟拿最高那排书架上的书。看到大姐姐的行为，我感到很高兴。我认为她这样做是对的。这种行为值得我们学习和称赞，我们应该在别人需要帮助时，伸出援助之手。

不远处，还有一个小男孩坐在地上安静地看书。""",
        "vocab": [
            {"chinese": "图书馆", "pinyin": "tú shū guǎn", "english": "library", "example": "图书馆里的情景。", "image": "https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_640.jpg"},
            {"chinese": "借书", "pinyin": "jiè shū", "english": "borrow books", "example": "很多同学在排队借书。", "image": "https://cdn.pixabay.com/photo/2015/09/05/07/28/library-924915_640.jpg"},
            {"chinese": "排队", "pinyin": "pái duì", "english": "queue up", "example": "同学们在排队等待借书。", "image": "https://cdn.pixabay.com/photo/2017/08/01/09/04/people-2563491_640.jpg"},
            {"chinese": "图书管理员", "pinyin": "tú shū guǎn lǐ yuán", "english": "librarian", "example": "把书交给图书管理员。", "image": "https://cdn.pixabay.com/photo/2017/08/06/22/01/books-2596809_640.jpg"},
            {"chinese": "专心", "pinyin": "zhuān xīn", "english": "concentrate", "example": "男同学和女同学在专心地看书。", "image": "https://cdn.pixabay.com/photo/2015/07/31/11/45/library-869061_640.jpg"},
            {"chinese": "大声", "pinyin": "dà shēng", "english": "loudly", "example": "两个女同学在一边看书，一边大声地讲话。", "image": "https://cdn.pixabay.com/photo/2017/07/31/11/46/people-2557508_640.jpg"},
            {"chinese": "讲话", "pinyin": "jiǎng huà", "english": "talk", "example": "她们一边看书，一边大声地讲话。", "image": "https://cdn.pixabay.com/photo/2014/07/31/23/49/conversation-407896_640.jpg"},
            {"chinese": "书架", "pinyin": "shū jià", "english": "bookshelf", "example": "书架前，有一个大姐姐。", "image": "https://cdn.pixabay.com/photo/2016/02/16/21/07/books-1204029_640.jpg"},
            {"chinese": "礼貌", "pinyin": "lǐ mào", "english": "manners/politeness", "example": "应该注意公共场所的基本礼貌。", "image": "https://cdn.pixabay.com/photo/2016/11/14/04/45/handshake-1822507_640.jpg"},
            {"chinese": "吵闹", "pinyin": "chǎo nào", "english": "noisy", "example": "不应该大声吵闹，影响别人。", "image": "https://cdn.pixabay.com/photo/2018/07/01/20/01/music-3510326_640.jpg"},
            {"chinese": "影响", "pinyin": "yǐng xiǎng", "english": "affect/influence", "example": "大声吵闹会影响别人。", "image": "https://cdn.pixabay.com/photo/2017/01/14/10/56/people-1979261_640.jpg"},
            {"chinese": "援助", "pinyin": "yuán zhù", "english": "help/assist", "example": "伸出援助之手。", "image": "https://cdn.pixabay.com/photo/2018/03/09/22/27/hand-3212768_640.jpg"}
        ]
    },
    5: {
        "title": "第五课：组屋楼下",
        "subtitle": "Void Deck",
        "emoji": "🏢",
        "text": """这张图片描绘的是组屋楼下的情景。我想现在应该是下午的时候，这里有很多人，十分热闹。

桌子旁边，有两个背着书包的男孩做完功课后，没有把桌子收拾干净，就转身准备离开。看到他们的行为，我感到十分生气。我认为他们这样做是不对的。不收拾餐桌是一种没有公德心的行为，他们应该保持桌面清洁，吃完饭把餐桌收拾干净，而且这样做也会引来蚂蚁。

电梯旁，有很多人在排队等电梯。

不远处，有两个男孩蹲在地上，他们拿着画笔在墙上乱涂乱画。看到他们的行为，我感到很生气。我认为他们这样做是不对的。乱涂乱画是一种没有公德心的行为，他们不应该为了一时好玩就把墙壁弄脏。如果人人都像他一样，那我们的新加坡就不再那么美好了。""",
        "vocab": [
            {"chinese": "组屋楼下", "pinyin": "zǔ wū lóu xià", "english": "void deck", "example": "组屋楼下的情景。", "image": "https://cdn.pixabay.com/photo/2019/05/17/09/27/singapore-4209031_640.jpg"},
            {"chinese": "背着", "pinyin": "bēi zhe", "english": "carrying", "example": "两个背着书包的男孩。", "image": "https://cdn.pixabay.com/photo/2014/07/16/02/18/backpack-394168_640.jpg"},
            {"chinese": "功课", "pinyin": "gōng kè", "english": "homework", "example": "男孩做完功课后。", "image": "https://cdn.pixabay.com/photo/2015/07/28/22/05/child-865116_640.jpg"},
            {"chinese": "收拾", "pinyin": "shōu shi", "english": "clean up", "example": "没有把桌子收拾干净。", "image": "https://cdn.pixabay.com/photo/2017/08/06/12/52/woman-2592247_640.jpg"},
            {"chinese": "干净", "pinyin": "gān jìng", "english": "clean", "example": "应该保持桌面清洁。", "image": "https://cdn.pixabay.com/photo/2016/11/29/08/42/desk-1868530_640.jpg"},
            {"chinese": "电梯", "pinyin": "diàn tī", "english": "elevator", "example": "有很多人在排队等电梯。", "image": "https://cdn.pixabay.com/photo/2015/05/15/14/31/elevator-768765_640.jpg"},
            {"chinese": "蹲", "pinyin": "dūn", "english": "squat", "example": "两个男孩蹲在地上。", "image": "https://cdn.pixabay.com/photo/2016/11/29/03/53/child-1867175_640.jpg"},
            {"chinese": "画笔", "pinyin": "huà bǐ", "english": "paintbrush", "example": "他们拿着画笔。", "image": "https://cdn.pixabay.com/photo/2017/08/03/11/18/artist-2575762_640.jpg"},
            {"chinese": "墙", "pinyin": "qiáng", "english": "wall", "example": "在墙上乱涂乱画。", "image": "https://cdn.pixabay.com/photo/2016/11/18/17/47/brick-1835865_640.jpg"},
            {"chinese": "乱涂乱画", "pinyin": "luàn tú luàn huà", "english": "scribble/graffiti", "example": "在墙上乱涂乱画。", "image": "https://cdn.pixabay.com/photo/2016/10/07/13/36/graffiti-1721541_640.jpg"},
            {"chinese": "弄脏", "pinyin": "nòng zāng", "english": "make dirty", "example": "不应该把墙壁弄脏。", "image": "https://cdn.pixabay.com/photo/2019/08/25/13/34/graffiti-4429578_640.jpg"},
            {"chinese": "蚂蚁", "pinyin": "mǎ yǐ", "english": "ant", "example": "这样做也会引来蚂蚁。", "image": "https://cdn.pixabay.com/photo/2014/10/24/08/09/ant-500904_640.jpg"}
        ]
    },
    6: {
        "title": "第六课：巴刹",
        "subtitle": "Market",
        "emoji": "🛒",
        "text": """这张图片描绘的是巴刹里的情景。我想现在应该是周末的时候，这里有很多人在买东西。

在卖鱼的摊位前，有一个阿姨正在买鱼，她的儿子开心地从卖鱼的摊主手中接过袋子，摊主竖起大拇指，夸奖小男孩。看到小男孩的行为，我感到很开心。我认为他这样做是对的。这种行为值得我们学习和称赞，我们也应该像他一样，做一名懂事的孩子。

在他们的旁边，有两个孩子在玩你追我跑。男孩不小心撞到一个阿姨，阿姨差一点跌倒，地听得张大嘴巴，篮子也挥在了地上。看到这两个孩子的行为，我感到十分生气。我认为他们这样做是不对的。在公共场所你追我跑是很危险的，一不小心就可能发生意外，他们应该注意安全。如果当时我在场，我会上前阻止他们。

在卖菜的摊位前，一个阿姨想要买青菜，她正在跟摊主讲价，摊主摆摆手说不可以。在卖水果的摊位前，有一个小女孩想要买苹果，我想应该是她的妈妈不同意。于是，小女孩拉着妈妈的裙子，吵着不肯离开。那位妈妈转过头，她着眉头，十分生气。看到小女孩的行为，我感到十分生气。我认为她这样做是不对的。我们应该注意公共场所的基本礼貌，不应该大声吵闹，影响别人。""",
        "vocab": [
            {"chinese": "巴刹", "pinyin": "bā shā", "english": "market", "example": "巴刹里的情景。", "image": "https://cdn.pixabay.com/photo/2016/03/02/20/54/market-1232944_640.jpg"},
            {"chinese": "摊位", "pinyin": "tān wèi", "english": "stall", "example": "在卖鱼的摊位前。", "image": "https://cdn.pixabay.com/photo/2014/10/23/10/10/market-499775_640.jpg"},
            {"chinese": "摊主", "pinyin": "tān zhǔ", "english": "stall owner", "example": "从卖鱼的摊主手中接过袋子。", "image": "https://cdn.pixabay.com/photo/2016/11/08/05/18/hot-1807561_640.jpg"},
            {"chinese": "竖起", "pinyin": "shù qǐ", "english": "raise up", "example": "摊主竖起大拇指。", "image": "https://cdn.pixabay.com/photo/2018/03/27/21/43/thumbs-up-3267374_640.jpg"},
            {"chinese": "大拇指", "pinyin": "dà mǔ zhǐ", "english": "thumb", "example": "竖起大拇指夸奖小男孩。", "image": "https://cdn.pixabay.com/photo/2019/10/06/10/03/team-4529717_640.jpg"},
            {"chinese": "懂事", "pinyin": "dǒng shì", "english": "sensible", "example": "做一名懂事的孩子。", "image": "https://cdn.pixabay.com/photo/2016/11/14/03/16/boy-1822471_640.jpg"},
            {"chinese": "撞", "pinyin": "zhuàng", "english": "bump into", "example": "男孩不小心撞到一个阿姨。", "image": "https://cdn.pixabay.com/photo/2017/06/17/13/11/girl-2412019_640.jpg"},
            {"chinese": "跌倒", "pinyin": "diē dǎo", "english": "fall down", "example": "阿姨差一点跌倒。", "image": "https://cdn.pixabay.com/photo/2019/01/31/10/40/kid-3966671_640.jpg"},
            {"chinese": "篮子", "pinyin": "lán zi", "english": "basket", "example": "篮子也掉在了地上。", "image": "https://cdn.pixabay.com/photo/2016/11/30/15/00/basket-1872997_640.jpg"},
            {"chinese": "青菜", "pinyin": "qīng cài", "english": "vegetables", "example": "阿姨想要买青菜。", "image": "https://cdn.pixabay.com/photo/2016/08/11/08/04/vegetables-1585034_640.jpg"},
            {"chinese": "讲价", "pinyin": "jiǎng jià", "english": "bargain", "example": "她正在跟摊主讲价。", "image": "https://cdn.pixabay.com/photo/2014/03/12/18/45/handshake-286215_640.jpg"},
            {"chinese": "苹果", "pinyin": "píng guǒ", "english": "apple", "example": "小女孩想要买苹果。", "image": "https://cdn.pixabay.com/photo/2016/11/30/15/00/apples-1872997_640.jpg"}
        ]
    },
    7: {
        "title": "第七课：公园",
        "subtitle": "Park",
        "emoji": "🏞️",
        "text": """这张图片描绘的是公园里的情景。我想现在应该是周末的时候，这里有很多人，非常热闹。

在草丛旁，有三个小男孩在玩你追我跑。突然，有一个小男孩一不小心跌倒了，他躺在地上，疼得闭着眼睛。看到他们的行为，我感到十分担心。我认为他们这样做是不对的。在公共场所抽烟是一种没有公德心的行为，抽烟不但对自己和别人的身体不好，而且也会让周围的空气不新鲜。

在他们的前面，有个小男孩牵着一只小狗在散步，小狗把大便留在了地上，小男孩好像没有看见一样，准备离开。看到小男孩的行为，我感到十分生气。我认为他这样做是不对的。这是一种没有公德心的行为，他不应该为了一时方便就让小狗随地大便，破坏环境。如果当时我在场，我会上前阻止他，告诉他应该清理粪便。

在他们的前面，有一个小女孩正在荡秋千，她玩得不亦乐乎。在她的旁边，有四个小朋友正在排队溜滑梯，他们玩得十分开心。在他们的后面，有一个小男孩和一个小女孩在放风筝，看着天上飞舞的风筝，他们的脸上露出了开心的笑容。不远处，还有两位叔叔和一位阿姨正随着音乐做体操，他们也非常开心。""",
        "vocab": [
            {"chinese": "公园", "pinyin": "gōng yuán", "english": "park", "example": "公园里的情景。", "image": "https://cdn.pixabay.com/photo/2016/10/18/21/28/park-1751488_640.jpg"},
            {"chinese": "草丛", "pinyin": "cǎo cóng", "english": "grass", "example": "在草丛旁。", "image": "https://cdn.pixabay.com/photo/2015/06/08/15/02/grass-802034_640.jpg"},
            {"chinese": "牵", "pinyin": "qiān", "english": "lead/hold", "example": "小男孩牵着一只小狗。", "image": "https://cdn.pixabay.com/photo/2016/12/13/05/15/dog-1903313_640.jpg"},
            {"chinese": "散步", "pinyin": "sàn bù", "english": "take a walk", "example": "牵着小狗在散步。", "image": "https://cdn.pixabay.com/photo/2017/09/07/21/48/walk-2726876_640.jpg"},
            {"chinese": "大便", "pinyin": "dà biàn", "english": "defecate", "example": "小狗把大便留在了地上。", "image": "https://cdn.pixabay.com/photo/2019/03/09/17/30/dog-4044513_640.jpg"},
            {"chinese": "随地", "pinyin": "suí dì", "english": "anywhere", "example": "不应该让小狗随地大便。", "image": "https://cdn.pixabay.com/photo/2016/10/10/14/46/icon-1728552_640.jpg"},
            {"chinese": "清理", "pinyin": "qīng lǐ", "english": "clean up", "example": "应该清理粪便。", "image": "https://cdn.pixabay.com/photo/2018/03/18/15/26/broom-3236966_640.jpg"},
            {"chinese": "粪便", "pinyin": "fèn biàn", "english": "feces", "example": "应该清理粪便。", "image": "https://cdn.pixabay.com/photo/2019/03/27/15/21/poo-4084846_640.jpg"},
            {"chinese": "溜滑梯", "pinyin": "liū huá tī", "english": "slide down", "example": "小朋友正在排队溜滑梯。", "image": "https://cdn.pixabay.com/photo/2016/11/18/14/58/child-1834965_640.jpg"},
            {"chinese": "放风筝", "pinyin": "fàng fēng zhēng", "english": "fly a kite", "example": "小男孩和小女孩在放风筝。", "image": "https://cdn.pixabay.com/photo/2017/07/21/23/57/kite-2527280_640.jpg"},
            {"chinese": "飞舞", "pinyin": "fēi wǔ", "english": "flying", "example": "看着天上飞舞的风筝。", "image": "https://cdn.pixabay.com/photo/2013/07/12/18/38/kite-153640_640.jpg"},
            {"chinese": "体操", "pinyin": "tǐ cāo", "english": "gymnastics/exercise", "example": "随着音乐做体操。", "image": "https://cdn.pixabay.com/photo/2017/08/06/12/52/fitness-2592339_640.jpg"}
        ]
    },
    8: {
        "title": "第八课：植物园",
        "subtitle": "Botanical Garden",
        "emoji": "🌳",
        "text": """这张图片描绘的是植物园里的情景。我想现在应该是下午的时候，这里有很多人，非常热闹。

池塘边有一棵大树，有一个小男孩爬在树上，用树枝打乌窝里的小鸟。看到他的行为，我感到十分生气。我认为他这样做是不对的。我们应该爱护小动物，不应该伤害它们。如果当时我在场，我会上前阻止他。

在大树下，有三个人在表演，他们有的在摇沙链，有的一点弹吉他，还有的在吹口琴，旁边的小朋友听了，都拍手叫好。在草地上，有一位老师指着树木，正在教三名学生认识植物，同学们听得非常认真，其中一个小男孩还在专心地做笔记。

在他们的后面，有三个男同学坐在席子上野餐，他们一边谈天，一边吃东西。他们随手把垃圾去了草地上。看到小男孩的行为，我感到十分生气。我认为他们这样做是不对的。在公共场所玩球是很危险的，一不小心就有可能造成别人受伤，他们应该注意安全。

总的来说，植物园里风景迷人，大家在这里玩得非常开心。""",
        "vocab": [
            {"chinese": "植物园", "pinyin": "zhí wù yuán", "english": "botanical garden", "example": "植物园里的情景。", "image": "https://cdn.pixabay.com/photo/2015/04/23/21/59/hot-air-balloon-736879_640.jpg"},
            {"chinese": "池塘", "pinyin": "chí táng", "english": "pond", "example": "池塘边有一棵大树。", "image": "https://cdn.pixabay.com/photo/2014/11/21/03/17/pond-540036_640.jpg"},
            {"chinese": "大树", "pinyin": "dà shù", "english": "big tree", "example": "池塘边有一棵大树。", "image": "https://cdn.pixabay.com/photo/2015/03/26/09/54/tree-690085_640.jpg"},
            {"chinese": "树枝", "pinyin": "shù zhī", "english": "tree branch", "example": "用树枝打鸟窝里的小鸟。", "image": "https://cdn.pixabay.com/photo/2015/04/19/08/32/branch-729755_640.jpg"},
            {"chinese": "鸟窝", "pinyin": "niǎo wō", "english": "bird nest", "example": "打鸟窝里的小鸟。", "image": "https://cdn.pixabay.com/photo/2020/03/31/19/20/nest-4988891_640.jpg"},
            {"chinese": "小鸟", "pinyin": "xiǎo niǎo", "english": "bird", "example": "鸟窝里的小鸟。", "image": "https://cdn.pixabay.com/photo/2017/05/08/13/15/bird-2295436_640.jpg"},
            {"chinese": "爱护", "pinyin": "ài hù", "english": "care for", "example": "我们应该爱护小动物。", "image": "https://cdn.pixabay.com/photo/2016/01/19/17/48/caring-1149873_640.jpg"},
            {"chinese": "表演", "pinyin": "biǎo yǎn", "english": "perform", "example": "有三个人在表演。", "image": "https://cdn.pixabay.com/photo/2016/11/22/19/15/audience-1850130_640.jpg"},
            {"chinese": "吉他", "pinyin": "jí tā", "english": "guitar", "example": "有的在弹吉他。", "image": "https://cdn.pixabay.com/photo/2017/05/01/18/18/guitar-2276181_640.jpg"},
            {"chinese": "口琴", "pinyin": "kǒu qín", "english": "harmonica", "example": "有的在吹口琴。", "image": "https://cdn.pixabay.com/photo/2019/05/31/14/19/harmonica-4242553_640.jpg"},
            {"chinese": "野餐", "pinyin": "yě cān", "english": "picnic", "example": "男同学坐在席子上野餐。", "image": "https://cdn.pixabay.com/photo/2017/06/06/22/37/picnic-2378566_640.jpg"},
            {"chinese": "席子", "pinyin": "xí zi", "english": "mat", "example": "坐在席子上野餐。", "image": "https://cdn.pixabay.com/photo/2019/04/07/20/24/mat-4110606_640.jpg"}
        ]
    },
    9: {
        "title": "第九课：快餐店",
        "subtitle": "Fast Food Restaurant",
        "emoji": "🍔",
        "text": """这张图片描绘的是快餐店里的情景。我想现在应该是下午的时候，这里有很多人，非常热闹。

在厕所门口，有一位阿姨正准备走进厕所。这时，她的身后是来一位妈妈和一个小女孩，小女孩用手括着肚子，看起来很急。阿姨看见了，连忙让小女孩先进厕所，旁边的妈妈点头表示感谢。看到阿姨的行为，我感到十分高兴。我认为她这样做是对的。这种行为值得我们学习和称赞，我们应该在别人需要帮助时，伸出援助之手。

在厕所旁边，有一位叔叔正抽出一张纸巾，准备擦手。

在他的旁边，有一个小男孩在洗手盆前洗手，他把水龙头的水开得很大，水溅得到处都是。看到小男孩的行为，我感到十分生气。我认为他这样做是不对的。因为水是宝贵的，我们不应该浪费水。如果当时我在场，我会上前阻止他。

洗手盆用围很脏，地上有很多垃圾，还有几滩水。一位清洁工人正拿着拖把打扫卫生，他看起来十分忙碌。

在他的前面，有一位叔叔用完餐后，把垃圾去进了垃圾桶里。

在窗边，有很多人正坐在桌子旁，一边吃东西，一边谈天说地，他们吃得津津有味。""",
        "vocab": [
            {"chinese": "快餐店", "pinyin": "kuài cān diàn", "english": "fast food restaurant", "example": "快餐店里的情景。", "image": "https://cdn.pixabay.com/photo/2016/11/18/14/05/fast-food-1834977_640.jpg"},
            {"chinese": "厕所", "pinyin": "cè suǒ", "english": "toilet", "example": "有一位阿姨正准备走进厕所。", "image": "https://cdn.pixabay.com/photo/2016/11/18/17/15/bathroom-1835886_640.jpg"},
            {"chinese": "括", "pinyin": "kuò", "english": "hold", "example": "小女孩用手括着肚子。", "image": "https://cdn.pixabay.com/photo/2019/03/27/15/21/stomach-4084846_640.jpg"},
            {"chinese": "肚子", "pinyin": "dù zi", "english": "stomach", "example": "用手括着肚子，看起来很急。", "image": "https://cdn.pixabay.com/photo/2016/11/14/04/14/stomach-1822450_640.jpg"},
            {"chinese": "纸巾", "pinyin": "zhǐ jīn", "english": "tissue paper", "example": "抽出一张纸巾，准备擦手。", "image": "https://cdn.pixabay.com/photo/2020/03/27/17/03/toilet-paper-4974461_640.jpg"},
            {"chinese": "擦", "pinyin": "cā", "english": "wipe", "example": "准备擦手。", "image": "https://cdn.pixabay.com/photo/2017/08/25/19/46/hands-2681201_640.jpg"},
            {"chinese": "洗手盆", "pinyin": "xǐ shǒu pén", "english": "wash basin", "example": "小男孩在洗手盆前洗手。", "image": "https://cdn.pixabay.com/photo/2019/03/13/17/25/sink-4053165_640.jpg"},
            {"chinese": "水龙头", "pinyin": "shuǐ lóng tóu", "english": "tap/faucet", "example": "他把水龙头的水开得很大。", "image": "https://cdn.pixabay.com/photo/2018/03/08/18/44/tap-3209146_640.jpg"},
            {"chinese": "溅", "pinyin": "jiàn", "english": "splash", "example": "水溅得到处都是。", "image": "https://cdn.pixabay.com/photo/2014/09/24/09/59/water-458625_640.jpg"},
            {"chinese": "清洁工", "pinyin": "qīng jié gōng", "english": "cleaner", "example": "一位清洁工人正拿着拖把。", "image": "https://cdn.pixabay.com/photo/2018/10/12/21/07/cleaning-3743369_640.jpg"},
            {"chinese": "拖把", "pinyin": "tuō bǎ", "english": "mop", "example": "拿着拖把打扫卫生。", "image": "https://cdn.pixabay.com/photo/2017/08/06/12/20/cleaning-2591907_640.jpg"},
            {"chinese": "津津有味", "pinyin": "jīn jīn yǒu wèi", "english": "with relish", "example": "他们吃得津津有味。", "image": "https://cdn.pixabay.com/photo/2014/09/17/20/26/restaurant-449952_640.jpg"}
        ]
    },
    10: {
        "title": "第十课：口试目录",
        "subtitle": "Exam Vocabulary Review",
        "emoji": "📖",
        "text": """口试目录 - W37-W40 重点词汇复习

这一课是对前九课所有重点词汇的总复习。在口试考试中，你需要：

1. 看图说话 - 观察图片，描述你看到的情景
2. 词汇运用 - 正确使用学过的词汇
3. 表达观点 - 对不当行为表达看法
4. 提出建议 - 给出合理的建议

复习重点：
- 公共场所的行为规范
- 环保意识
- 助人为乐
- 文明礼貌
- 安全意识

记住口试答题模板：
1. 这张图片描绘的是...的情景
2. 我想现在应该是...的时候
3. 看到...的行为，我感到...
4. 我认为他/她这样做是（不）对的
5. 如果当时我在场，我会...

加油！相信你一定能在口试中取得好成绩！""",
        "vocab": [
            {"chinese": "游乐场", "pinyin": "yóu lè chǎng", "english": "playground (W40)", "example": "游乐场里有很多小朋友在玩耍。", "image": "https://cdn.pixabay.com/photo/2016/11/10/11/20/playground-1814094_640.jpg"},
            {"chinese": "客厅", "pinyin": "kè tīng", "english": "living room (W40)", "example": "一家人在客厅里吃晚餐。", "image": "https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_640.jpg"},
            {"chinese": "巴士站", "pinyin": "bā shì zhàn", "english": "bus station (W40)", "example": "很多人在巴士站等车。", "image": "https://cdn.pixabay.com/photo/2017/08/05/16/00/bus-2584486_640.jpg"},
            {"chinese": "德士站", "pinyin": "dé shì zhàn", "english": "taxi stand (W39)", "example": "德士站有很多德士在排队。", "image": "https://cdn.pixabay.com/photo/2019/07/30/16/37/taxi-4373226_640.jpg"},
            {"chinese": "图书馆", "pinyin": "tú shū guǎn", "english": "library (W39)", "example": "同学们在图书馆安静地看书。", "image": "https://cdn.pixabay.com/photo/2017/07/02/00/43/library-2463227_640.jpg"},
            {"chinese": "组屋楼下", "pinyin": "zǔ wū lóu xià", "english": "void deck (W39)", "example": "组屋楼下有很多人在活动。", "image": "https://cdn.pixabay.com/photo/2018/08/04/10/23/building-3583346_640.jpg"},
            {"chinese": "巴刹", "pinyin": "bā shā", "english": "market (W38)", "example": "巴刹里有很多新鲜的蔬菜水果。", "image": "https://cdn.pixabay.com/photo/2014/10/22/18/13/market-498777_640.jpg"},
            {"chinese": "公园", "pinyin": "gōng yuán", "english": "park (W38)", "example": "周末公园里有很多人。", "image": "https://cdn.pixabay.com/photo/2016/11/23/17/56/bench-1854116_640.jpg"},
            {"chinese": "植物园", "pinyin": "zhí wù yuán", "english": "botanical garden (W37)", "example": "植物园里有各种各样的植物。", "image": "https://cdn.pixabay.com/photo/2017/04/06/10/54/garden-2208270_640.jpg"},
            {"chinese": "快餐店", "pinyin": "kuài cān diàn", "english": "fast food restaurant (W37)", "example": "快餐店里人很多。", "image": "https://cdn.pixabay.com/photo/2015/09/09/17/58/restaurant-932310_640.jpg"}
        ]
    }
}

# Update each lesson file
for lesson_num, data in lessons.items():
    filename = f"koushi25-lesson{lesson_num}.html"

    # Read the file
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = content.replace('第一课：游乐场 - 口试练习', f'{data["title"]} - 口试练习')
    content = content.replace('<h1>第一课：游乐场</h1>', f'<h1>{data["title"]}</h1>')
    content = content.replace('Playground Activities - 场景词汇练习', f'{data["subtitle"]} - 场景词汇练习')

    # Update emoji
    content = content.replace('🎪', data['emoji'])

    # Update story text
    old_text_start = content.find('这张图片描绘的是游乐场里的情景')
    old_text_end = content.find('</div>', old_text_start)
    if old_text_start != -1 and old_text_end != -1:
        content = content[:old_text_start] + data['text'] + content[old_text_end:]

    # Update vocabulary
    vocab_js = 'const vocabulary = [\n'
    for vocab in data['vocab']:
        vocab_js += f'''            {{
                chinese: "{vocab['chinese']}",
                pinyin: "{vocab['pinyin']}",
                english: "{vocab['english']}",
                example: "{vocab['example']}",
                image: "{vocab['image']}"
            }},\n'''
    vocab_js = vocab_js.rstrip(',\n') + '\n        ];'

    # Find and replace vocabulary array
    vocab_start = content.find('const vocabulary = [')
    vocab_end = content.find('];', vocab_start) + 2
    if vocab_start != -1 and vocab_end != -1:
        content = content[:vocab_start] + vocab_js + content[vocab_end:]

    # Update localStorage keys
    content = content.replace("'koushi25_lesson1_learned'", f"'koushi25_lesson{lesson_num}_learned'")
    content = content.replace("'koushi25_lesson1_progress'", f"'koushi25_lesson{lesson_num}_progress'")

    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {filename}")

print("All lessons updated successfully!")