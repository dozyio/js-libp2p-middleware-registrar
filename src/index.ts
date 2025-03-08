/**
 * @packageDocumentation
 * A registrar implementation that decorates protocols with middleware
 */

import { MiddlewareRegistrar } from './middleware-registry.js'
import type { ComponentLogger } from '@libp2p/interface'
import type { Registrar } from '@libp2p/interface-internal'

/**
 * Provider of middleware functionality
 */
export interface Middleware {
  /**
   * Start the provider
   */
  start(): Promise<void>

  /**
   * Stop the provider
   */
  stop(): Promise<void>

  /**
   * Check if the provider is started
   */
  isStarted(): boolean

  /**
   * Decorate a connection with middleware
   */
  decorate(connectionId: string): Promise<boolean>

  /**
   * Check if a connection is already decorated
   */
  isDecorated(connectionId: string): boolean

  /**
   * Protocol name of your middleware (e.g. /mw/auth/1.0.0). If your middleware
   * needs to run a protocol stream, e.g. for authentication, set the protocol
   * name here.
   */
  protocol?: string

  /**
   * Exclude is a list of protocols that won't have middleware applied
   */
  exclude?: string[]
}

/**
 * Options for middleware decorator
 */
export type MiddlewareDecoratorOptions = Record<string, any>

/**
 * Components required for the middleware registrar
 */
export interface RegistrarComponents {
  registrar: Registrar
  logger: ComponentLogger
}

/**
 * Options for the middleware registrar
 */
export interface MiddlewareRegistrarOptions {
  /**
   * Default middleware options to apply to all protocols
   */
  defaultOptions?: MiddlewareDecoratorOptions

  /**
   * Per-protocol middleware options
   */
  protocolOptions?: Record<string, MiddlewareDecoratorOptions>
}

/**
 * Create a new middleware registrar which acts as a drop-in replacement
 * for the standard registrar but automatically decorates all protocol handlers
 * with the specified middleware provider
 */
export function middlewareRegistrar (
  components: RegistrarComponents,
  middleware: Middleware,
  options: MiddlewareRegistrarOptions = {}
): Registrar {
  // Create the middleware registry with the original registrar
  const registry = new MiddlewareRegistrar(
    components.registrar,
    middleware,
    components.logger,
    options.defaultOptions
  )

  // Configure protocol-specific options if provided
  if (options.protocolOptions != null) {
    for (const [protocol, opts] of Object.entries(options.protocolOptions)) {
      registry.setProtocolOptions(protocol, opts)
    }
  }

  return registry
}

export { MiddlewareRegistrar }
