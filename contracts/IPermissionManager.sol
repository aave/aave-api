pragma solidity 0.6.12;

interface IPermissionManager {
  /**
   * @dev Returns the permissions configuration for a specific user
   * @param user The address of the user
   * @return the set of permissions states for the user
   **/
  function getUserPermissions(address user) external view returns (uint256[] memory, uint256);

  /**
   * @dev Used to query if a certain user has a certain role
   * @param user The address of the user
   * @return True if the user is in the specific role
   **/
  function isInRole(address user, uint256 role) external view returns (bool);
}