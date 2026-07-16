UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class UHealthComponent : public UActorComponent {
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MaxHealth;
    UPROPERTY(Replicated, BlueprintReadWrite) float CurrentHealth;

    UFUNCTION(BlueprintCallable) void TakeDamage(float Amount, ATHEHIVECharacter* Attacker);
    UFUNCTION(BlueprintCallable) void Heal(float Amount);
    UFUNCTION(BlueprintCallable) void Revive();

    DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnHealthChanged, UHealthComponent*, float);
    UPROPERTY(BlueprintAssignable) FOnHealthChanged OnHealthChanged;
};
