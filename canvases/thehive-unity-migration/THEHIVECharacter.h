UCLASS()
class ATHEHIVECharacter : public ACharacter {
    GENERATED_BODY()
public:
    UPROPERTY(Replicated, BlueprintReadWrite) FString CharacterId;
    UPROPERTY(Replicated, BlueprintReadWrite) FString UserId;
    UPROPERTY(Replicated, BlueprintReadWrite) int32 Level;
    UPROPERTY(Replicated, BlueprintReadWrite) FString Class;

    UPROPERTY(VisibleAnywhere) UHealthComponent* HealthComponent;
    UPROPERTY(VisibleAnywhere) UManaComponent* ManaComponent;
    UPROPERTY(VisibleAnywhere) UInventoryComponent* InventoryComponent;

    UFUNCTION(Server, Reliable, WithValidation)
    void ServerMove(const FVector& InputVector, float DeltaTime);

    UFUNCTION(Server, Reliable, WithValidation)
    void ServerAttack(const FString& SkillId, ATHEHIVECharacter* Target);
};
