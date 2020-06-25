// 送信機のAボタンが押されたら
// ・動作指示を走行とする
// ・動作指示に対応したアイコンの表示
// ・動作指示の送信
// を行う。
input.onButtonPressed(Button.A, function () {
    // 動作を決定
    g_mode = "Run"
    // アイコンの表示
    showIcon()
    // 動作指示を送信
    radio.sendString(g_mode)
})
// 動作モードに従ったアイコン表示関数
function showIcon () {
    switch (g_mode) {
    // 走行モード（笑い顔）
    case "Run":
        basic.showIcon(IconNames.Happy)
        break
    // 停止モード（泣き顔）
    case "Stop":
        basic.showIcon(IconNames.Sad)
        break
    }
}
// フロントＬＥＤ表示関数
// ・交互に点滅を繰り返す
function led_on (mtime: number) {
    if (g_time < input.runningTime()) {
        g_led_left = (g_led_left == maqueen.LEDswitch.turnOff) ? maqueen.LEDswitch.turnOn : g_led_right = maqueen.LEDswitch.turnOff
        g_led_right = (g_led_right == maqueen.LEDswitch.turnOff) ? maqueen.LEDswitch.turnOn : g_led_right = maqueen.LEDswitch.turnOff
        // 次の点滅時間の算出
        g_time = input.runningTime() + mtime
    }
    maqueen.writeLED(maqueen.LED.LEDLeft, g_led_left)
    maqueen.writeLED(maqueen.LED.LEDRight, g_led_right)
}
// 送信機からの動作指示を受信して
// ・動作の決定
// ・動作に対応したアイコン表示
// を行う。
radio.onReceivedString(function (receivedString) {
    // 受信した動作指示を保存
    g_mode = receivedString
    // アイコンの表示
    showIcon()
})
// 送信機のBボタンが押されたら
// ・動作指示を停止とする
// ・動作指示に対応したアイコンの表示
// ・動作指示の送信
// を行う。
input.onButtonPressed(Button.B, function () {
    // 動作を決定
    g_mode = "Stop"
    // アイコンの表示
    showIcon()
    // 動作指示を送信
    radio.sendString(g_mode)
})
// ライントレース走行関数
// ・全タイヤライン上
// ・左タイヤ逸脱
// ・右タイヤ逸脱
// ・全タイヤ逸脱
// 上記の場合のタイヤ回転指示を行う。
function lineTrace (speed: number) {
    // 全タイヤライン上（左右：回転）
    // 左タイヤのライン逸脱（左：回転・右：停止）
    // 右タイヤのライン逸脱（右：回転・左：停止）
    if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
        g_speed_reft = speed
        g_speed_right = speed
    } else if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
        g_speed_reft = speed
        g_speed_right = 0
    } else if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
        g_speed_reft = 0
        g_speed_right = speed
    }
    // 全タイヤ回転動作指示（全タイヤ逸脱：前回の動作指示を継続）
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, g_speed_reft)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, g_speed_right)
}
// 走行停止動作関数
// ・全モータ停止
function Stop () {
    maqueen.motorStop(maqueen.Motors.All)
}
let g_speed_right = 0
let g_speed_reft = 0
let g_time = 0
let g_mode = ""
let c_mtime = 1000
g_time = input.runningTime() + c_mtime
g_mode = "Stop"
let g_speed = 30
let g_led_left:maqueen.LEDswitch = maqueen.LEDswitch.turnOn
let g_led_right:maqueen.LEDswitch = maqueen.LEDswitch.turnOff
radio.setGroup(1)
basic.showIcon(IconNames.Asleep)
// 主処理
// 動作モードに従った以下の処理を行う。
// ・ライントレース
// ・走行停止
// ・フロントＬＥＤ点滅
basic.forever(function () {
    switch (g_mode)
    {
    case "Run":
        lineTrace(g_speed)
        led_on(c_mtime)
        break
    case "Stop":
        Stop()
        break
    }
})
