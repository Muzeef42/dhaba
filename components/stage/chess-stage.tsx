"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  RotateCcw,
  Maximize,
  Minimize,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useMaybeRoomContext, useTracks, VideoTrack, isTrackReference, type TrackReference } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useRoomSync, SyncEventPayload } from "@/hooks/use-room-sync";

// Piece types
type PieceColor = "w" | "b";
type PieceType = "p" | "r" | "n" | "b" | "q" | "k";

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

type BoardState = (ChessPiece | null)[][];

interface PlayerSeat {
  username: string;
  identity?: string;
}

// Initial Standard Chess Board
const INITIAL_BOARD: BoardState = [
  [
    { type: "r", color: "b" },
    { type: "n", color: "b" },
    { type: "b", color: "b" },
    { type: "q", color: "b" },
    { type: "k", color: "b" },
    { type: "b", color: "b" },
    { type: "n", color: "b" },
    { type: "r", color: "b" },
  ],
  Array(8).fill({ type: "p", color: "b" }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: "p", color: "w" }),
  [
    { type: "r", color: "w" },
    { type: "n", color: "w" },
    { type: "b", color: "w" },
    { type: "q", color: "w" },
    { type: "k", color: "w" },
    { type: "b", color: "w" },
    { type: "n", color: "w" },
    { type: "r", color: "w" },
  ],
];

// Classic Vector Chess SVGs
function PieceIcon({ piece }: { piece: ChessPiece }) {
  const isWhite = piece.color === "w";
  const fill = isWhite ? "#ffffff" : "#262421";
  const stroke = isWhite ? "#312e2b" : "#ffffff";

  switch (piece.type) {
    case "p":
      return (
        <svg viewBox="0 0 45 45" className="w-[80%] h-[80%] drop-shadow-md transition-transform hover:scale-110">
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "r":
      return (
        <svg viewBox="0 0 45 45" className="w-[80%] h-[80%] drop-shadow-md transition-transform hover:scale-110">
          <path
            d="m 9,39 27,0 c 0,-3 -3,-3 -3,-6 L 12,33 c 0,3 -3,3 -3,6 z m 3,-7.5 21,0 c 0,-1.5 -1.5,-3 -3,-4.5 l -15,0 c -1.5,1.5 -3,3 -3,4.5 z m 2,-6 17,0 0,-3.5 -17,0 z M 11,19 l 23,0 0,-5 -3,0 0,2 -4,0 0,-2 -4,0 0,2 -4,0 0,-2 -4,0 0,2 -4,0 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "n":
      return (
        <svg viewBox="0 0 45 45" className="w-[80%] h-[80%] drop-shadow-md transition-transform hover:scale-110">
          <path
            d="m 22,10 c -2.5,0 -4,1 -5.5,3.5 -1,1.5 -2,4 -1.5,6.5 0.5,2.5 2,3.5 2.5,4.5 -1,0.5 -3,1.5 -3.5,3.5 -0.5,2 0.5,3.5 1,4.5 -1,0.5 -3,1.5 -3.5,3.5 -0.5,2 0.5,3 2,3.5 l 17,0 c 0.5,-1 1,-2 1,-3 0,-3 -2,-4.5 -3,-6 1,-1 2.5,-3 2.5,-6 0,-4 -3.5,-7 -6.5,-9.5 -0.5,-0.5 -1.5,-1 -2.5,-1 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "b":
      return (
        <svg viewBox="0 0 45 45" className="w-[80%] h-[80%] drop-shadow-md transition-transform hover:scale-110">
          <path
            d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,1 -3.39,-0.21 -10.11,1.73 -13.5,-1 -3.39,2.73 -10.11,0.79 -13.5,1 -1.35,-0.01 -2.32,-0.03 -3,-1 1.35,-1.46 3,-2 3,-2 z m 15,-4 c -1.62,2.5 -6,2 -6,4 0,2 1.5,3 4.5,3 3,0 4.5,-1 4.5,-3 0,-2 -4.38,-1.5 -6,-4 z M 24.5,7.5 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z m -2,3.5 c -4,0 -7,4 -7,9 0,3 1,6 3,8.5 2,2.5 4,4 4,4 0,0 2,-1.5 4,-4 2,-2.5 3,-5.5 3,-8.5 0,-5 -3,-9 -7,-9 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case "q":
      return (
        <svg viewBox="0 0 45 45" className="w-[85%] h-[85%] drop-shadow-md transition-transform hover:scale-110">
          <path
            d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,5 -4,-8 -4.5,8 -7,-5 2.5,12 z M 9,39 l 27,0 c 0,-2.5 -2.5,-3 -2.5,-3 l -22,0 c 0,0 -2.5,0.5 -2.5,3 z m 2.5,-5 22,0 c 1,-1.5 0,-2.5 0,-2.5 l -22,0 c 0,0 -1,1 0,2.5 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "k":
      return (
        <svg viewBox="0 0 45 45" className="w-[85%] h-[85%] drop-shadow-md transition-transform hover:scale-110">
          <path
            d="m 22.5,11.5 0,-6 m -3,3 6,0 m -3,3 c 4,0 7.5,3 7.5,7 0,3.5 -2,6 -4.5,8 3,1 6,4 6,8.5 l -18,0 c 0,-4.5 3,-7.5 6,-8.5 -2.5,-2 -4.5,-4.5 -4.5,-8 0,-4 3.5,-7 7.5,-7 z M 11.5,37 l 22,0 c 0,-2 -2,-2.5 -2,-2.5 l -18,0 c 0,0 -2,0.5 -2,2.5 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

interface ChessStageProps {
  roomId: string;
  username: string;
  onClose: () => void;
}

export function ChessStage({ roomId, username, onClose }: ChessStageProps) {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("w");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [whitePlayer, setWhitePlayer] = useState<PlayerSeat | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<PlayerSeat | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live audio/video states for players
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // Play a soft wooden click sound on moves via Web Audio API
  const playMoveSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }, []);

  // Sync moves and seat claims across room
  const handleIncomingSync = useCallback(
    (payload: SyncEventPayload) => {
      if ((payload as any).type === "CHESS_MOVE") {
        const { from, to, turn } = payload as any;
        setBoard((prev) => {
          const next = prev.map((row) => [...row]);
          const movingPiece = next[from[0]][from[1]];
          next[to[0]][to[1]] = movingPiece;
          next[from[0]][from[1]] = null;
          return next;
        });
        setCurrentTurn(turn);
        playMoveSound();
      } else if ((payload as any).type === "CHESS_SEAT") {
        const { seat, player } = payload as any;
        if (seat === "white") setWhitePlayer(player);
        if (seat === "black") setBlackPlayer(player);
      } else if ((payload as any).type === "CHESS_RESET") {
        setBoard(INITIAL_BOARD);
        setCurrentTurn("w");
        setSelectedSquare(null);
      }
    },
    [playMoveSound]
  );

  const { broadcastSync } = useRoomSync(roomId, handleIncomingSync);

  // Video track resolution from LiveKit
  const room = useMaybeRoomContext();
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const localTrack = cameraTracks.find(
    (t) => isTrackReference(t) && t.participant.identity === room?.localParticipant.identity
  );

  // Find camera track for a player by username/identity
  const getPlayerTrack = (player: PlayerSeat | null) => {
    if (!player) return null;
    if (player.username === username) return localTrack;
    return cameraTracks.find(
      (t) => isTrackReference(t) && (t.participant.name === player.username || t.participant.identity === player.username)
    );
  };

  const whiteTrack = useMemo(() => getPlayerTrack(whitePlayer), [whitePlayer, cameraTracks, localTrack]);
  const blackTrack = useMemo(() => getPlayerTrack(blackPlayer), [blackPlayer, cameraTracks, localTrack]);

  // Seat toggle handlers
  const handleClaimWhite = () => {
    if (whitePlayer?.username === username) {
      setWhitePlayer(null);
      broadcastSync({ type: "CHESS_SEAT", seat: "white", player: null } as any);
    } else {
      const p = { username };
      setWhitePlayer(p);
      broadcastSync({ type: "CHESS_SEAT", seat: "white", player: p } as any);
    }
  };

  const handleClaimBlack = () => {
    if (blackPlayer?.username === username) {
      setBlackPlayer(null);
      broadcastSync({ type: "CHESS_SEAT", seat: "black", player: null } as any);
    } else {
      const p = { username };
      setBlackPlayer(p);
      broadcastSync({ type: "CHESS_SEAT", seat: "black", player: p } as any);
    }
  };

  // Reset board
  const handleResetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentTurn("w");
    setSelectedSquare(null);
    setMenuOpen(false);
    broadcastSync({ type: "CHESS_RESET" } as any);
  };

  // Move validation logic
  const isValidMove = (r1: number, c1: number, r2: number, c2: number): boolean => {
    const piece = board[r1][c1];
    if (!piece) return false;
    const dest = board[r2][c2];
    if (dest && dest.color === piece.color) return false;

    const dr = r2 - r1;
    const dc = c2 - c1;

    switch (piece.type) {
      case "p": {
        const dir = piece.color === "w" ? -1 : 1;
        const startRow = piece.color === "w" ? 6 : 1;
        // Normal 1 step
        if (dc === 0 && dr === dir && !dest) return true;
        // 2 step from start
        if (dc === 0 && dr === 2 * dir && r1 === startRow && !dest && !board[r1 + dir][c1]) return true;
        // Diagonal capture
        if (Math.abs(dc) === 1 && dr === dir && dest && dest.color !== piece.color) return true;
        return false;
      }
      case "r": {
        if (dr !== 0 && dc !== 0) return false;
        const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
        const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
        let currR = r1 + stepR;
        let currC = c1 + stepC;
        while (currR !== r2 || currC !== c2) {
          if (board[currR][currC]) return false;
          currR += stepR;
          currC += stepC;
        }
        return true;
      }
      case "n":
        return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
      case "b": {
        if (Math.abs(dr) !== Math.abs(dc)) return false;
        const stepR = dr > 0 ? 1 : -1;
        const stepC = dc > 0 ? 1 : -1;
        let currR = r1 + stepR;
        let currC = c1 + stepC;
        while (currR !== r2 && currC !== c2) {
          if (board[currR][currC]) return false;
          currR += stepR;
          currC += stepC;
        }
        return true;
      }
      case "q": {
        if (dr === 0 || dc === 0) {
          const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
          const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
          let currR = r1 + stepR;
          let currC = c1 + stepC;
          while (currR !== r2 || currC !== c2) {
            if (board[currR][currC]) return false;
            currR += stepR;
            currC += stepC;
          }
          return true;
        } else if (Math.abs(dr) === Math.abs(dc)) {
          const stepR = dr > 0 ? 1 : -1;
          const stepC = dc > 0 ? 1 : -1;
          let currR = r1 + stepR;
          let currC = c1 + stepC;
          while (currR !== r2 && currC !== c2) {
            if (board[currR][currC]) return false;
            currR += stepR;
            currC += stepC;
          }
          return true;
        }
        return false;
      }
      case "k":
        return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    }
  };

  const handleSquareClick = (r: number, c: number) => {
    // If square already selected, attempt move
    if (selectedSquare) {
      const [fromR, fromC] = selectedSquare;
      if (fromR === r && fromC === c) {
        setSelectedSquare(null);
        return;
      }

      if (isValidMove(fromR, fromC, r, c)) {
        const nextBoard = board.map((row) => [...row]);
        const piece = nextBoard[fromR][fromC];
        nextBoard[r][c] = piece;
        nextBoard[fromR][fromC] = null;

        // Auto Queen promotion
        if (piece?.type === "p" && (r === 0 || r === 7)) {
          nextBoard[r][c] = { type: "q", color: piece.color };
        }

        const nextTurn: PieceColor = currentTurn === "w" ? "b" : "w";
        setBoard(nextBoard);
        setCurrentTurn(nextTurn);
        setSelectedSquare(null);
        playMoveSound();

        // Broadcast move to room
        broadcastSync({
          type: "CHESS_MOVE",
          from: [fromR, fromC],
          to: [r, c],
          turn: nextTurn,
        } as any);
        return;
      }
    }

    // Select piece
    const clickedPiece = board[r][c];
    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedSquare([r, c]);
    } else {
      setSelectedSquare(null);
    }
  };

  // Toggle room camera / mic
  const toggleMic = () => {
    if (room?.localParticipant) {
      room.localParticipant.setMicrophoneEnabled(!micEnabled);
    }
    setMicEnabled(!micEnabled);
  };

  const toggleCam = () => {
    if (room?.localParticipant) {
      room.localParticipant.setCameraEnabled(!camEnabled);
    }
    setCamEnabled(!camEnabled);
  };

  return (
    <div className="w-full h-full relative bg-[#120f18] text-white flex flex-col items-center justify-between overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <div className="w-full px-4 py-2.5 flex items-center justify-between border-b border-purple-950/40 bg-[#160029]/80 backdrop-blur-md z-30">
        {/* Purple Chess Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-[#6b21a8] hover:bg-[#7e22ce] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            <span>♟️</span>
            <span>Chess</span>
            <ChevronDown size={14} className={menuOpen ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-[#22043e] border border-purple-500/40 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in text-xs font-semibold">
              <button
                onClick={handleResetGame}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition cursor-pointer"
              >
                <RotateCcw size={14} className="text-[#ffe600]" />
                <span>Restart Game</span>
              </button>
              <div className="my-1 border-t border-purple-800/40" />
              <button
                onClick={onClose}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-300 hover:text-white hover:bg-red-900/40 transition cursor-pointer"
              >
                <X size={14} />
                <span>Exit Chess</span>
              </button>
            </div>
          )}
        </div>

        {/* Turn Indicator */}
        <div className="flex items-center gap-2 bg-[#230442] border border-purple-500/30 px-3.5 py-1 rounded-full text-xs font-bold shadow-inner">
          <div className={`w-3 h-3 rounded-full ${currentTurn === "w" ? "bg-[#f0d9b5]" : "bg-[#4a3728] border border-white/20"}`} />
          <span className="text-purple-200">
            {currentTurn === "w" ? "White's turn" : "Black's turn"}
          </span>
        </div>

        {/* Voice / Video Toggles & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition border border-purple-500/25 ${
              micEnabled ? "bg-purple-900/60 text-white" : "bg-red-600/80 text-white"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
          </button>

          <button
            onClick={toggleCam}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition border border-purple-500/25 ${
              camEnabled ? "bg-purple-900/60 text-white" : "bg-red-600/80 text-white"
            }`}
            title={camEnabled ? "Disable Camera" : "Enable Camera"}
          >
            {camEnabled ? <Video size={14} /> : <VideoOff size={14} />}
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-purple-950/60 hover:bg-red-600 text-purple-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Playing Stage Area */}
      <div className="flex-1 w-full max-w-5xl flex items-center justify-between px-4 sm:px-8 py-2 relative">
        {/* LEFT PLAYER (BLACK) */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {/* Player Circular Video Feed */}
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#1e1a24] border-4 ${
                currentTurn === "b" ? "border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]" : "border-stone-700/80"
              } flex items-center justify-center transition-all duration-300 relative`}
            >
              {blackTrack && camEnabled ? (
                <VideoTrack trackRef={blackTrack as TrackReference} className="w-full h-full object-cover" />
              ) : blackPlayer ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2438] to-[#15121e]">
                  <span className="text-3xl font-black text-purple-200">
                    {blackPlayer.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-purple-300/80 mt-1 font-bold">
                    {blackPlayer.username}
                  </span>
                </div>
              ) : (
                <div className="text-stone-600 flex flex-col items-center">
                  <span className="text-3xl">♟️</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-stone-500">Empty</span>
                </div>
              )}
            </div>

            {/* Small Circular Black Piece Badge */}
            <div className="absolute right-0 bottom-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#4a3728] border-2 border-white shadow-lg flex items-center justify-center text-xs">
              ♟
            </div>
          </div>

          {/* Play Black Button */}
          <button
            onClick={handleClaimBlack}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition transform hover:scale-105 cursor-pointer ${
              blackPlayer?.username === username
                ? "bg-stone-700 hover:bg-stone-600 text-white"
                : "bg-white hover:bg-gray-100 text-black"
            }`}
          >
            {blackPlayer?.username === username ? "Leave Black" : "Play Black"}
          </button>
        </div>

        {/* CENTER: THE 8x8 CHESS BOARD */}
        <div className="relative p-2 bg-[#2c1b12] rounded-xl shadow-2xl border-4 border-[#41281b]">
          <div className="grid grid-cols-8 grid-rows-8 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[440px] md:h-[440px] border border-black/30">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
                const isRankLabel = c === 7;
                const isFileLabel = r === 7;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#f7ec59]"
                        : isLight
                        ? "bg-[#f0d9b5]"
                        : "bg-[#b58863]"
                    }`}
                  >
                    {/* Chess Piece Vector Icon */}
                    {piece && <PieceIcon piece={piece} />}

                    {/* Coordinate Rank Labels (1-8 on right edge) */}
                    {isRankLabel && (
                      <span
                        className={`absolute top-0.5 right-1 text-[9px] font-bold select-none pointer-events-none ${
                          isLight ? "text-[#b58863]" : "text-[#f0d9b5]"
                        }`}
                      >
                        {8 - r}
                      </span>
                    )}

                    {/* Coordinate File Labels (a-h on bottom edge) */}
                    {isFileLabel && (
                      <span
                        className={`absolute bottom-0.5 left-1 text-[9px] font-bold select-none pointer-events-none ${
                          isLight ? "text-[#b58863]" : "text-[#f0d9b5]"
                        }`}
                      >
                        {String.fromCharCode(97 + c)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PLAYER (WHITE) */}
        <div className="flex flex-col items-center gap-3">
          {/* Play White Button */}
          <button
            onClick={handleClaimWhite}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition transform hover:scale-105 cursor-pointer ${
              whitePlayer?.username === username
                ? "bg-stone-700 hover:bg-stone-600 text-white"
                : "bg-white hover:bg-gray-100 text-black"
            }`}
          >
            {whitePlayer?.username === username ? "Leave White" : "Play White"}
          </button>

          <div className="relative">
            {/* Player Circular Video Feed */}
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#1e1a24] border-4 ${
                currentTurn === "w" ? "border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]" : "border-stone-700/80"
              } flex items-center justify-center transition-all duration-300 relative`}
            >
              {whiteTrack && camEnabled ? (
                <VideoTrack trackRef={whiteTrack as TrackReference} className="w-full h-full object-cover" />
              ) : whitePlayer ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2438] to-[#15121e]">
                  <span className="text-3xl font-black text-purple-200">
                    {whitePlayer.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-purple-300/80 mt-1 font-bold">
                    {whitePlayer.username}
                  </span>
                </div>
              ) : (
                <div className="text-stone-600 flex flex-col items-center">
                  <span className="text-3xl">♙</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-stone-500">Empty</span>
                </div>
              )}
            </div>

            {/* Small Circular White Piece Badge */}
            <div className="absolute right-0 bottom-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f0d9b5] border-2 border-stone-800 shadow-lg flex items-center justify-center text-xs text-black">
              ♙
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full py-1 text-center text-[11px] text-purple-400/60 font-medium">
        Click a piece to see valid moves • Play in real-time with friends in the room
      </div>
    </div>
  );
}