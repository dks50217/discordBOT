## About

這是個可撥鼠機器人

![alt text](https://cdn.discordapp.com/emojis/701825381791170691.png?v=1)

## Start
> install node_modules
```cmd
npm install
```
> add auth.json
```json
{
   "token": "[Input your discord app token]"
}
```
> active
```cmd
node bot
```

## Method Table

| Prefix        | Method        |  Example      |    ResponseExample   |
| ------------- |:-------------:| -------------:| -------------:   | 
| !             | Call item      | !可撥         | 我就可撥
| +             | Add item       | +可撥 我就可撥 | 我就可撥 已加入 
| -             | Remove item    | -可撥 我就可撥 | 我就可撥 已移除
| *             | Show all item  | *可撥         | 0. 我就可撥
| #             | Setting        | #[join]       | -
|               |                | #[leave]      | -
|               |                | #[presence]   | -
|               |                | #[tts]        | 語音已開啟/關閉(預設為關閉)
|               |                | #[rename] OOO     | XXX 已修改 XXX的匿名 為OOO
|               |                | #[ignore] OOO     | XXX 已加入忽略清單
|               |                | #[ignoreAdd] OOO  | XXX 已加入忽略清單
|               |                | #[monkey/mouse]         | 預設回復已開啟/關閉(預設為開啟)
|               |                | #[reply] OOO     | 預設回復已更改為OOO
|               |                | #[allParent]     | 顯示全部父項
|%              | ChangeWeight   | %可撥 我就可撥 1.2| 可撥,我就可撥 已設定為1.2
| ?             | Show help      |               |