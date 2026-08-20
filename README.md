# OpedFight

Protótipo de jogo de luta 2D no estilo Street Fighter 3, feito em TypeScript + Canvas 2D (via Vite).

## Rodando

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (padrão `http://localhost:5173`).

## Controles

**Jogador 1**
- Mover: `A` / `D`
- Pular: `W`
- Agachar / Segurar para trás = bloquear: `S`
- Soco: `J`
- Chute: `K`

**Jogador 2**
- Mover: `←` / `→`
- Pular: `↑`
- Agachar / Segurar para trás = bloquear: `↓`
- Soco: `Numpad1` ou `,`
- Chute: `Numpad2` ou `.`

O personagem sempre encara o oponente automaticamente. Segurar a direção contrária ao oponente bloqueia ataques (reduz muito o dano e o hitstun).

## Estrutura

- `src/game/Fighter.ts` — física, estados e máquina de ataque de cada lutador
- `src/game/Game.ts` — loop principal (timestep fixo), colisões e round
- `src/game/Input.ts` — mapeamento de teclado para os dois jogadores
- `src/game/Arena.ts` / `Renderer.ts` / `Hud.ts` — desenho do cenário, lutadores (placeholders) e HUD

## Próximos passos sugeridos

- Trocar os placeholders (retângulos) por spritesheets animados
- Adicionar combos, specials e super meter
- Efeitos sonoros e de partícula nos golpes
- Menu de seleção de personagem e melhor tela de resultado
