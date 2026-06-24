/**
 * PHASER TOWN HALL v2 — Sovereign Hive
 * Agents wander the map as animated sprites.
 * Click an agent to inspect genome / ELO.
 */

const PHASER_EFFECT = `
useEffect(() => {
  if (tab !== "swarm" || phaserGameRef.current || !phaserContainerRef.current) return;

  class TownHallScene extends Phaser.Scene {
    constructor() { super({ key: "TownHall" }); }

    create() {
      const W = this.scale.width;
      const H = this.scale.height;
      this.agentSprites = {};
      this.taskCards = [];
      this.selectedAgent = null;
      this.infoPanel = null;
      this._agents = agentsRef.current || [];
      this._tasks = taskListRef.current || [];

      // Background
      const gfx = this.add.graphics();
      gfx.fillStyle(0x080c14, 1);
      gfx.fillRect(0, 0, W, H);
      gfx.lineStyle(1, 0x1a2a3a, 0.4);
      for (let x = 0; x < W; x += 40) { gfx.moveTo(x, 0); gfx.lineTo(x, H); }
      for (let y = 0; y < H; y += 40) { gfx.moveTo(0, y); gfx.lineTo(W, y); }
      gfx.strokePath();

      // Town Hall board
      this.boardZone = { x: W * 0.72, y: H * 0.22, w: 200, h: H * 0.6 };
      const bz = this.boardZone;
      const boardGfx = this.add.graphics();
      boardGfx.fillStyle(0x0a1a2e, 1);
      boardGfx.fillRoundedRect(bz.x, bz.y, bz.w, bz.h, 8);
      boardGfx.lineStyle(2, 0x2a6cff, 0.6);
      boardGfx.strokeRoundedRect(bz.x, bz.y, bz.w, bz.h, 8);
      this.add.text(bz.x + bz.w / 2, bz.y + 14, "▐ TOWN HALL ▌", {
        fontSize: "11px", color: "#5baeff", fontFamily: "Courier New",
        align: "center"
      }).setOrigin(0.5, 0);

      this._renderTaskCards();
      this.resonanceRing = this.add.graphics();
      this._pulseT = 0;
      this._agents.forEach((agent, i) => this._spawnAgent(agent, i));
      this._buildInfoPanel();
      this.input.on("pointerdown", (ptr) => this._handleClick(ptr));
      this.time.addEvent({ delay: 2000, loop: true, callback: this._wanderTick, callbackScope: this });
    }

    _spawnAgent(agent, index) {
      const W = this.scale.width;
      const H = this.scale.height;
      const usableW = W * 0.65;
      const x = Phaser.Math.Between(40, usableW - 40);
      const y = Phaser.Math.Between(50, H - 50);
      const elo = (eloRef.current || []).find(e => e.agent_name === agent.name);
      const rating = elo ? elo.rating : 1200;
      const radius = Phaser.Math.Clamp(Math.floor((rating - 800) / 100) + 10, 8, 22);
      const color = this._eloColor(rating);

      const gfx = this.add.graphics();
      gfx.fillStyle(color, 0.15);
      gfx.fillCircle(0, 0, radius + 6);
      gfx.fillStyle(color, 0.9);
      gfx.fillCircle(0, 0, radius);
      gfx.fillStyle(0xffffff, 0.5);
      gfx.fillCircle(0, 0, radius * 0.35);

      const container = this.add.container(x, y, [gfx]);
      container.setSize(radius * 2 + 12, radius * 2 + 12);
      container.setInteractive();

      const label = this.add.text(0, radius + 5, agent.name.substring(0, 8), {
        fontSize: "8px", color: "#a0c8ff", fontFamily: "Courier New"
      }).setOrigin(0.5, 0);
      container.add(label);

      const badge = this.add.text(0, -(radius + 8), \`◈\${rating}\`, {
        fontSize: "7px", color: "#ffd700", fontFamily: "Courier New"
      }).setOrigin(0.5, 1);
      container.add(badge);

      this.tweens.add({
        targets: container,
        scaleX: 1.1, scaleY: 1.1,
        duration: 1500 + index * 200,
        yoyo: true, loop: -1,
        ease: "Sine.easeInOut"
      });

      this.agentSprites[agent.name] = {
        container, gfx, label, badge,
        x, y, target: { x, y },
        agent, elo: rating,
        state: "idle",
        radius
      };
    }

    _eloColor(elo) {
      if (elo >= 1800) return 0xffd700;
      if (elo >= 1600) return 0xee82ee;
      if (elo >= 1400) return 0x00ff88;
      if (elo >= 1200) return 0x2a9fff;
      return 0x888888;
    }

    _renderTaskCards() {
      this.taskCards.forEach(c => c.destroy());
      this.taskCards = [];
      const bz = this.boardZone;
      const tasks = taskListRef.current || [];
      tasks.slice(0, 6).forEach((task, i) => {
        const cardY = bz.y + 36 + i * 58;
        const cardGfx = this.add.graphics();
        const statusColor = task.status === "open" ? 0x00c878
          : task.status === "assigned" ? 0xffaa00 : 0x555555;
        cardGfx.fillStyle(0x0f1e30, 1);
        cardGfx.fillRoundedRect(bz.x + 8, cardY, bz.w - 16, 50, 4);
        cardGfx.lineStyle(1, statusColor, 0.8);
        cardGfx.strokeRoundedRect(bz.x + 8, cardY, bz.w - 16, 50, 4);

        const titleText = this.add.text(bz.x + 15, cardY + 6,
          (task.title || "Untitled").substring(0, 22), {
            fontSize: "9px", color: "#ddeeff", fontFamily: "Courier New",
            wordWrap: { width: bz.w - 30 }
          });
        const statusText = this.add.text(bz.x + 15, cardY + 33,
          \`[\${task.status}]\${task.assignee ? " → " + task.assignee.substring(0,8) : ""}\`, {
            fontSize: "7px", color: "#" + statusColor.toString(16).padStart(6,"0"),
            fontFamily: "Courier New"
          });
        this.taskCards.push(cardGfx, titleText, statusText);
      });

      if (tasks.length === 0) {
        const noTask = this.add.text(
          bz.x + bz.w / 2, bz.y + bz.h / 2,
          "No tasks yet\\nCreate one in Town Hall tab",
          { fontSize: "9px", color: "#445566", align: "center", fontFamily: "Courier New" }
        ).setOrigin(0.5);
        this.taskCards.push(noTask);
      }
    }

    _wanderTick() {
      const W = this.scale.width;
      const H = this.scale.height;
      const usableW = W * 0.60;

      Object.values(this.agentSprites).forEach(sprite => {
        if (sprite.state === "selected") return;
        const rand = Math.random();
        if (rand < 0.3) {
          sprite.target.x = this.boardZone.x - 30 + Math.random() * 20;
          sprite.target.y = this.boardZone.y + 40 + Math.random() * (this.boardZone.h - 80);
          sprite.state = "at_board";
        } else if (rand < 0.8) {
          sprite.target.x = Phaser.Math.Between(30, usableW - 30);
          sprite.target.y = Phaser.Math.Between(30, H - 30);
          sprite.state = "walking";
        }

        this.tweens.add({
          targets: sprite.container,
          x: sprite.target.x,
          y: sprite.target.y,
          duration: 1500 + Math.random() * 1000,
          ease: "Sine.easeInOut",
          onComplete: () => {
            sprite.x = sprite.target.x;
            sprite.y = sprite.target.y;
            if (sprite.state !== "selected") sprite.state = "idle";
          }
        });
      });
    }

    _handleClick(ptr) {
      let hit = null;
      for (const [name, sprite] of Object.entries(this.agentSprites)) {
        const dx = ptr.x - sprite.container.x;
        const dy = ptr.y - sprite.container.y;
        if (Math.sqrt(dx*dx + dy*dy) < sprite.radius + 12) { hit = name; break; }
      }
      if (hit) {
        this._showInfo(this.agentSprites[hit]);
        if (onAgentSelectRef.current) onAgentSelectRef.current(hit);
      } else {
        this._hideInfo();
      }
    }

    _buildInfoPanel() {
      this.infoPanel = {
        bg:    this.add.graphics().setVisible(false),
        name:  this.add.text(0, 0, "", { fontSize: "11px", color: "#ffffff", fontFamily: "Courier New" }).setVisible(false),
        elo:   this.add.text(0, 0, "", { fontSize: "9px",  color: "#ffd700", fontFamily: "Courier New" }).setVisible(false),
        state: this.add.text(0, 0, "", { fontSize: "9px",  color: "#a0c8ff", fontFamily: "Courier New" }).setVisible(false),
        traits:this.add.text(0, 0, "", { fontSize: "8px",  color: "#88cc88", fontFamily: "Courier New" }).setVisible(false),
      };
    }

    _showInfo(sprite) {
      const p = this.infoPanel;
      const panelX = 10, panelY = 10, panelW = 160, panelH = 90;
      p.bg.clear().setVisible(true);
      p.bg.fillStyle(0x000a1a, 0.92);
      p.bg.fillRoundedRect(panelX, panelY, panelW, panelH, 6);
      p.bg.lineStyle(1, this._eloColor(sprite.elo), 0.8);
      p.bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 6);

      p.name.setPosition(panelX + 8, panelY + 8).setText(sprite.agent.name).setVisible(true);
      p.elo.setPosition(panelX + 8, panelY + 24).setText(\`ELO: \${sprite.elo}\`).setVisible(true);
      p.state.setPosition(panelX + 8, panelY + 38).setText(\`State: \${sprite.state}\`).setVisible(true);

      const genome = sprite.agent.genome;
      if (genome) {
        const top = Object.entries(genome)
          .filter(([k]) => !["agent_name","generation"].includes(k))
          .sort((a,b) => b[1]-a[1]).slice(0,3)
          .map(([k,v]) => \`\${k.substring(0,6)}: \${(v*100).toFixed(0)}%\`).join("  ");
        p.traits.setPosition(panelX + 8, panelY + 52).setText(top).setVisible(true);
      } else {
        p.traits.setVisible(false);
      }

      this.selectedAgent = sprite.agent.name;
      sprite.state = "selected";
    }

    _hideInfo() {
      Object.values(this.infoPanel).forEach(o => o.setVisible(false));
      if (this.selectedAgent && this.agentSprites[this.selectedAgent]) {
        this.agentSprites[this.selectedAgent].state = "idle";
      }
      this.selectedAgent = null;
    }

    update(time) {
      this._pulseT = (this._pulseT + 0.01) % (Math.PI * 2);
      const alpha = 0.04 + 0.03 * Math.sin(this._pulseT * 7.83);
      this.resonanceRing.clear();
      this.resonanceRing.lineStyle(1, 0x3a7aff, alpha);
      const cx = this.scale.width * 0.32;
      const cy = this.scale.height * 0.5;
      const r = 60 + 40 * Math.sin(this._pulseT);
      this.resonanceRing.strokeCircle(cx, cy, r);
    }
  }

  const config = {
    type: Phaser.AUTO,
    parent: phaserContainerRef.current,
    width: phaserContainerRef.current.offsetWidth || 860,
    height: phaserContainerRef.current.offsetHeight || 440,
    backgroundColor: "#080c14",
    scene: TownHallScene,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
  };

  phaserGameRef.current = new Phaser.Game(config);
  return () => {
    if (phaserGameRef.current) { phaserGameRef.current.destroy(true); phaserGameRef.current = null; }
  };
}, [tab]);
`;

console.log("Phaser v2 scene ready.");
