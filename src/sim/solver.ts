/**
 * Configuration for the non-linear equation solver
 */
export type SolverConfig = {
    /** Function to minimize to 0 */
    f: (x: number) => number
    /** Minimum value for x (inclusive) */
    xMin: number
    /** Maximum value for x (inclusive) */
    xMax: number
    /** Maximum number of iterations */
    maxIterations?: number
    /** Tolerance for considering the result close enough to 0 */
    tolerance?: number
}

/**
 * Result of the solver
 */
export type SolverResult = {
    /** The x value that minimizes f(x) closest to 0 */
    x: number
    /** The value of f(x) at the solution */
    fx: number
    /** Number of iterations performed */
    iterations: number
    /** Whether the solver converged within tolerance */
    converged: boolean
}

/**
 * Simple bisection method to solve f(x) = 0
 * Uses bisection method which is robust and always converges for continuous functions
 */
export function solve(config: SolverConfig): SolverResult {
    const maxIterations = config.maxIterations ?? 100
    const tolerance = config.tolerance ?? 1e-6
    
    let xMin = config.xMin
    let xMax = config.xMax
    let iterations = 0
    
    // Check if the function has different signs at the endpoints
    const fMin = config.f(xMin)
    const fMax = config.f(xMax)
    
    // If f(xMin) and f(xMax) have the same sign, we can't use bisection
    // In this case, we'll do a simple grid search to find the minimum |f(x)|
    if (fMin * fMax > 0) {
        return gridSearch(config)
    }
    
    // Bisection method
    while (iterations < maxIterations && (xMax - xMin) > tolerance) {
        const xMid = (xMin + xMax) / 2
        const fMid = config.f(xMid)
        
        if (Math.abs(fMid) <= tolerance) {
            return {
                x: xMid,
                fx: fMid,
                iterations: iterations + 1,
                converged: true
            }
        }
        
        // Choose the half where the function changes sign
        if (fMin * fMid < 0) {
            xMax = xMid
        } else {
            xMin = xMid
        }
        
        iterations++
    }
    
    const finalX = (xMin + xMax) / 2
    const finalFx = config.f(finalX)
    
    return {
        x: finalX,
        fx: finalFx,
        iterations,
        converged: Math.abs(finalFx) <= tolerance
    }
}

/**
 * Fallback grid search method when bisection can't be used
 */
function gridSearch(config: SolverConfig): SolverResult {
    const maxIterations = config.maxIterations ?? 100
    const tolerance = config.tolerance ?? 1e-6
    
    let bestX = config.xMin
    let bestFx = config.f(config.xMin)
    let bestAbsFx = Math.abs(bestFx)
    
    const step = (config.xMax - config.xMin) / maxIterations
    
    for (let i = 0; i <= maxIterations; i++) {
        const x = config.xMin + i * step
        const fx = config.f(x)
        const absFx = Math.abs(fx)
        
        if (absFx < bestAbsFx) {
            bestX = x
            bestFx = fx
            bestAbsFx = absFx
        }
        
        if (absFx <= tolerance) {
            return {
                x,
                fx,
                iterations: i + 1,
                converged: true
            }
        }
    }
    
    return {
        x: bestX,
        fx: bestFx,
        iterations: maxIterations,
        converged: bestAbsFx <= tolerance
    }
}