/**
 * SpaceNavigation.tsx
 * WASD + mouse navigation for 3D space
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export interface SpaceNavigationProps {
  movementMode?: 'free' | 'orbit' | 'firstPerson' | 'thirdPerson' | 'fly';
  speed?: number;
}

// Camera rig — MUST be rendered inside a <Canvas>; useThree throws anywhere else.
export const SpaceNavigationRig = ({ speed = 5 }: SpaceNavigationProps) => {
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = speed * 0.1;
      switch (e.key.toLowerCase()) {
        case 'w': camera.position.z -= moveSpeed; break;
        case 'a': camera.position.x -= moveSpeed; break;
        case 's': camera.position.z += moveSpeed; break;
        case 'd': camera.position.x += moveSpeed; break;
      }
      camera.lookAt(0, 0, 0);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speed, camera]);

  return null;
};

// App and every tab render <SpaceNavigation /> at the DOM level, outside any
// Canvas — there is no camera to drive there, so render nothing rather than
// crash the whole route into the ErrorBoundary.
const SpaceNavigation = (_props: SpaceNavigationProps) => null;

export default SpaceNavigation;
