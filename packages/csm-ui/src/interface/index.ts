
import Material from '@tone./csm-core'

export type MaterialInfo = NonNullable<ReturnType<InstanceType<typeof Material>['find']>>

export type Info = MaterialInfo & { url: string }
