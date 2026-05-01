import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';

interface DrawingCanvasProps {
  className?: string;
}

export function DrawingCanvas({ className }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;

    const context = canvas.getContext('2d');
    if (context) {
      setCtx(context);
    }
    
    // Ensure parent is relative and gives us bounding bounds
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (!canvas) return;
        const rect = entry.contentRect;
        // Need to save imageData if we want to preserve drawing, but for now just resize
        const tempImageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        
        // Handle physical pixels 
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        if (context) {
          context.lineCap = 'round';
          context.lineJoin = 'round';
          if (tempImageData) context.putImageData(tempImageData, 0, 0);
        }
      }
    });

    resizeObserver.observe(parent);
    
    return () => resizeObserver.disconnect();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // We do NOT call preventDefault here otherwise touch inputs on buttons fail?
    // Wait, the canvas covers the buttons. We only prevent default if we want to prevent scrolling.
    if ('touches' in e && e.cancelable) {
      // Don't prevent default, or drawing will block scrolling. Wait, if paint is active, you shouldn't scroll? 
    }
    setIsDrawing(true);
    
    if (ctx) {
      ctx.beginPath();
      // Setup styles based on mode
      if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
      }
    }
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    
    // Prevent scrolling while drawing
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  return (
    <div className={`absolute inset-0 z-10 ${className || ''}`} style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none rounded-[1.5rem]"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
      />
      <div className="absolute -top-4 right-2 flex items-center gap-2 bg-white/90 p-1.5 rounded-[1rem] shadow-sm border border-slate-200 pointer-events-auto">
        <button 
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             setIsErasing(false);
          }}
          className={`p-2 rounded-lg transition-colors ${!isErasing ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
        </button>
        <button 
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             setIsErasing(true);
          }}
          className={`p-2 rounded-lg transition-colors ${isErasing ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
        >
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button 
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             if (ctx && canvasRef.current) {
                // To clear out completely, must reset composite mode
                ctx.globalCompositeOperation = 'source-over';
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
             }
          }}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          title="Стереть всё"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </div>
  );
}
