// 送信機のAボタンが押されたら
// ・動作指示を走行とする
// ・動作指示に対応したアイコンの表示
// ・動作指示の送信
// を行う。
input.onButtonPressed(Button.A, function () {
    // 動作指示を走行とする
    let mode = "Run"
    // 動作モードを初期化
    g_mode = ""
    // アイコンの表示
    showIcon(mode)
    // 動作を決定
    g_mode = mode
    // 動作指示を送信
    radio.sendString(mode)
})
// 動作モードに従ったアイコン表示関数
function showIcon (mode: string) {
    switch (mode) {
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
        // 点消灯の切り替え
        g_led_left = (g_led_left == maqueen.LEDswitch.turnOff) ? maqueen.LEDswitch.turnOn : g_led_right = maqueen.LEDswitch.turnOff
        g_led_right = (g_led_right == maqueen.LEDswitch.turnOff) ? maqueen.LEDswitch.turnOn : g_led_right = maqueen.LEDswitch.turnOff
        strip.shift(1)
        // 次の点滅時間の算出
        g_time = input.runningTime() + mtime
    }
    // フロントＬＥＤの点消灯
    maqueen.writeLED(maqueen.LED.LEDLeft, g_led_left)
    maqueen.writeLED(maqueen.LED.LEDRight, g_led_right)
    strip.show()
}
// 送信機からの動作指示を受信して
// ・動作の決定
// ・動作に対応したアイコン表示
// を行う。
radio.onReceivedString(function (receivedString) {
    // 動作モードを初期化
    g_mode = ""
    // アイコンの表示
    showIcon(receivedString)
    // 停止時間制御
    g_stop_time = input.runningTime() + 10000
    // 受信した動作指示を保存
    g_mode = receivedString
})
// 送信機のBボタンが押されたら
// ・動作指示を停止とする
// ・動作指示に対応したアイコンの表示
// ・動作指示の送信
// を行う。
input.onButtonPressed(Button.B, function () {
    // 動作指示を停止とする
    let mode = "Stop"
    // 動作モードを初期化
    g_mode = ""
    // アイコンの表示
    showIcon(mode)
    // 停止時間制御
    g_stop_time = input.runningTime() + 10000
    // 動作を決定
    g_mode = mode
    // 動作指示を送信
    radio.sendString(mode)
})
// ライントレース走行関数
// ・全タイヤライン上
// ・左タイヤ逸脱
// ・右タイヤ逸脱
// ・全タイヤ逸脱
// 上記の場合のタイヤ回転指示を行う。
function lineTrace (speed: number) {
    // 全タイヤライン上（左右：回転）
    if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
        g_speed_reft = speed
        g_speed_right = speed
    // 左タイヤのライン逸脱（左：回転・右：停止）    
    } else if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
        g_speed_reft = speed
        g_speed_right = 0
    // 右タイヤのライン逸脱（右：回転・左：停止）
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
    // モータ停止
    maqueen.motorStop(maqueen.Motors.All)
    // 初期状態へ
    if (g_stop_time < input.runningTime()) {
        basic.showIcon(IconNames.Asleep)
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
    }
}
// 変数の定義
let g_speed_right = 0
let g_speed_reft = 0
let g_stop_time = 0
let c_mtime = 1000
let g_time = input.runningTime() + c_mtime
let g_mode = ""
let g_speed = 30
let g_led_left = maqueen.LEDswitch.turnOn
let g_led_right = maqueen.LEDswitch.turnOff
let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)
// 初期処理
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
// バックグラウンド処理
control.inBackground(function () {
    while (1) {
        if (maqueen.Ultrasonic(PingUnit.Centimeters) != 0 && maqueen.Ultrasonic(PingUnit.Centimeters) < 10) {
            g_mode = "Stop"
            radio.sendString(g_mode)
            basic.showIcon(IconNames.No)
        }
        basic.pause(100)
    }
})