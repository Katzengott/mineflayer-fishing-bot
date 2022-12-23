const mineflayer = require('mineflayer')
const vec3 = require('vec3')
const delay = require('util').promisify(setTimeout)
const {pathfinder,Movements} = require('mineflayer-pathfinder')
const {GoalNear,GoalBlock,GoalFollow,GoalBreakBlock} = require('mineflayer-pathfinder').goals

const bot = mineflayer.createBot({
  host: "",
  port: "",

  username: "Fishing_Bot", //test@gmail.com
  auth: "offline",

  version: "1.19"
})
bot.loadPlugin(pathfinder)
let nowFishing = false
bot.once('spawn', () => {
  console.log('Ready')
})

bot.on('chat', (username, msg) => {
  if (bot.entity.username === username) return
  if (msg.toString().includes('start')) {
    startFishing()
  }

  if (msg.toString().includes('stop')) {
    stopFishing()
  }

})



function onCollect(player, entity) {
  console.log(entity)
  if (entity.metadata[8] && player === bot.entity) {
    bot.removeListener('playerCollect', onCollect)
    fishs()
  }
}
async function fishs() {
  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
  } catch (err) {
    return bot.chat(err.message)
  }

  nowFishing = true
  bot.on('playerCollect', onCollect)

  try {
    await bot.fish()
  } catch (err) {
    bot.chat(err.message)
  }
  nowFishing = false

}
async function startFishing() {
  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)
  defaultMove.allow1by1towers = true
  const scaffoldingBlocks = ['dirt', 'cobblestone', 'netherrack']
  const water = bot.findBlocks({
    matching: mcData.blocksByName.water.id,
    maxDistance: 64,
    count: 1
  })

  if (!water) {
    bot.chat(" I can't find water!")
    return
  }
  const w = bot.blockAt(water[0])
  const v = bot.blockAt(w.position.offset(0, 1, 0))

  bot.pathfinder.setMovements(defaultMove)
  bot.pathfinder.setGoal(new GoalNear(w.position.x, w.position.y, w.position.z, 3))
  bot.chat('Looking for water...')
  console.log('Fishing - Looking for water..')

  bot.once('goal_reached', async () => {
    bot.lookAt(v.position, false)

    console.log('I started fishing.')
    try {
      await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    } catch (err) {
      return bot.chat(err.message)
    }

    nowFishing = true
    bot.on('playerCollect', onCollect)

    try {
      await bot.fish()
    } catch (err) {
      bot.chat(err.message)
    }
    nowFishing = false
  })

}

function stopFishing() {
  bot.removeListener('playerCollect', onCollect)

  if (nowFishing) {
    bot.activateItem()
  }
}
