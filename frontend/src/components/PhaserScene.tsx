import { useEffect, useRef } from 'react'

interface Props {
  width?: number | string
  height?: number | string
  onZoneClick?: (zoneName: string) => void
}

export function PhaserScene({ width = '100%', height = '100%', onZoneClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let game: { destroy: (v: boolean) => void } | null = null

    const initPhaser = async () => {
      const Phaser = await import('phaser')

      class WorldScene extends Phaser.Scene {
        private zones: Array<{ ellipse: Phaser.GameObjects.Ellipse; name: string }> = []

        constructor() { super({ key: 'WorldScene' }) }

        create() {
          const W = this.scale.width
          const H = this.scale.height
          this.cameras.main.setBackgroundColor('#020617')

          const zoneData = [
            { name: 'SOUL REALM', x: 0.28, y: 0.32, rx: 0.12, ry: 0.09, color: 0xf59e0b },
            { name: 'ARENA BADLANDS', x: 0.48, y: 0.60, rx: 0.13, ry: 0.10, color: 0xef4444 },
            { name: 'TRUST CITADEL', x: 0.20, y: 0.60, rx: 0.10, ry: 0.09, color: 0x3b82f6 },
            { name: 'R&D ARCHIPELAGO', x: 0.68, y: 0.44, rx: 0.11, ry: 0.09, color: 0x8b5cf6 },
            { name: 'AETHER CITADEL', x: 0.36, y: 0.78, rx: 0.10, ry: 0.08, color: 0x06b6d4 },
            { name: 'AUTOMATISCH NEXUS', x: 0.78, y: 0.26, rx: 0.09, ry: 0.08, color: 0x10b981 },
            { name: 'KIMI ORACLE', x: 0.84, y: 0.60, rx: 0.09, ry: 0.08, color: 0xf97316 },
          ]

          zoneData.forEach(({ name, x, y, rx, ry, color }) => {
            const ellipse = this.add.ellipse(x * W, y * H, rx * W * 2, ry * H * 2, color, 0.12)
            ellipse.setStrokeStyle(1, color, 0.4)
            ellipse.setInteractive()
            ellipse.on('pointerdown', () => onZoneClick?.(name))
            ellipse.on('pointerover', () => ellipse.setAlpha(0.25))
            ellipse.on('pointerout', () => ellipse.setAlpha(1))

            this.add.text(x * W, y * H, name, {
              fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace'
            }).setOrigin(0.5)

            this.zones.push({ ellipse, name })

            // Schumann ring at soul realm
            if (name === 'SOUL REALM') {
              this.time.addEvent({
                delay: 200,
                callback: () => {
                  const ring = this.add.ellipse(x * W, y * H, 20, 20, 0, 0)
                  ring.setStrokeStyle(1, 0xf59e0b, 0.6)
                  this.tweens.add({
                    targets: ring,
                    scaleX: 8, scaleY: 8,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => ring.destroy(),
                  })
                },
                loop: true,
              })
            }
          })

          // Town hall at center
          const cx = W * 0.5, cy = H * 0.5
          this.add.rectangle(cx, cy + 15, 40, 30, 0x1e293b)
          this.add.triangle(cx, cy - 5, 0, 20, 20, -15, -20, -15, 0x334155)
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current!,
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
        scene: [WorldScene],
        backgroundColor: '#020617',
      }

      game = new Phaser.Game(config)
      gameRef.current = game
    }

    initPhaser()

    return () => {
      game?.destroy(true)
    }
  }, [onZoneClick])

  return (
    <div
      ref={containerRef}
      style={{ width, height, overflow: 'hidden', background: '#020617', borderRadius: '8px' }}
    />
  )
}

export default PhaserScene
