export const siteData = {
  brand: 'OUR UNIVERSE',
  nav: ['首页', '关于我们', '故事', '回忆', '纪念日'],
  hero: {
    eyebrow: 'TWO SOULS · ONE STORY',
    titleTop: '我们不是完美的人',
    titleBottom: '但刚好适合彼此。',
    description: '这里记录两个人的日常、旅行、碎碎念和那些值得反复回看的瞬间。没有复杂的功能，只有我们。',
    since: '2024.05.20',
    quote: '“比起永远，我更喜欢每天。”'
  },
  people: [
    {
      key: 'a',
      name: '一花',
      alias: 'YIHUA',
      role: '白昼 / 咖啡 / 旅行计划制造机',
      bio: '喜欢海边、晚风、拍照，还有把平凡日子过得稍微浪漫一点。',
      tags: ['摄影', '咖啡', '旅行', 'Vue3'],
      avatarText: 'Y'
    },
    {
      key: 'b',
      name: '阿泽',
      alias: 'AZE',
      role: '夜晚 / 音乐 / 氛围感维护员',
      bio: '喜欢音乐、夜景、电影，以及在所有普通时刻认真陪伴。',
      tags: ['音乐', '电影', '夜景', '记录'],
      avatarText: 'A'
    }
  ],
  stats: [
    { value: '827', label: '在一起的天数' },
    { value: '12', label: '一起去过的城市' },
    { value: '3,206', label: '收藏的照片' },
    { value: '∞', label: '还没讲完的故事' }
  ],
  timeline: [
    { date: '2024.05', title: '故事开始', text: '一次很普通的聊天，后来变成了每天最期待的消息。', side: 'left' },
    { date: '2024.09', title: '第一次旅行', text: '带着相机和没做完的攻略，去了海边，也从那天开始爱上一起出发。', side: 'right' },
    { date: '2025.02', title: '第一张合照墙', text: '把零散照片整理成一面墙，才发现原来我们已经拥有这么多共同回忆。', side: 'left' },
    { date: '2026.08', title: '我们的博客', text: '决定把故事写成一个网站。以后每一个值得纪念的瞬间，都放进这里。', side: 'right' }
  ],
  memories: [
    { image: '/memories/memory-1.svg', tag: 'TRIP', title: '去海边的那一天', date: '2026.06.18', text: '风很大，头发很乱，但照片每一张都很喜欢。' },
    { image: '/memories/memory-2.svg', tag: 'DAILY', title: '凌晨一点的便利店', date: '2026.04.03', text: '没有目的地的散步，最后买了两瓶汽水。' },
    { image: '/memories/memory-3.svg', tag: 'MOVIE', title: '雨天电影清单', date: '2026.02.14', text: '窗外下雨，屋里有电影、薯片和你。' },
    { image: '/memories/memory-4.svg', tag: 'PHOTO', title: '夕阳前的十分钟', date: '2025.11.09', text: '为了等一场日落，多绕了二十分钟的路。' },
    { image: '/memories/memory-5.svg', tag: 'CITY', title: '陌生城市的夜', date: '2025.08.27', text: '最喜欢的不是景点，是一起走过的不知名街道。' },
    { image: '/memories/memory-6.svg', tag: 'HOME', title: '普通周末', date: '2025.05.20', text: '睡到自然醒、点外卖、收拾房间，就是很好的约会。' }
  ],
  anniversary: {
    date: '2024-05-20T00:00:00+08:00',
    title: '下一页，也一起写。',
    text: '这个网页不需要后台。以后想新增照片、故事或纪念日，只需要改一份静态数据。'
  }
}
