public class CombatManager : NetworkBehaviour {
    [ServerRpc]
    public void AttackServerRpc(string attackerId, string targetId, string skillId) {
        var attacker = GetEntity(attackerId);
        var target = GetEntity(targetId);
        var skill = SkillDatabase.Get(skillId);

        if (!CanAttack(attacker, target, skill)) return;

        int damage = CalculateDamage(attacker, target, skill);
        ApplyEffects(target, skill.Effects);
        Clients.ReceiveDamage(targetId, damage);

        if (target.Health <= 0) OnDeath(target, attacker);
    }

    private int CalculateDamage(Entity attacker, Entity target, Skill skill) {
        int damage = skill.BaseDamage + attacker.Stats.Attack;
        damage = Mathf.Max(1, damage - target.Stats.Defense / 2);
        damage = Mathf.RoundToInt(damage * UnityEngine.Random.Range(0.9f, 1.1f));

        if (UnityEngine.Random.value < attacker.Stats.CriticalRate)
            damage = Mathf.RoundToInt(damage * attacker.Stats.CriticalMultiplier);

        return damage;
    }
}
